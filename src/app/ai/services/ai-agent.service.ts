import { computed, inject, Injectable, signal } from '@angular/core';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import {
  APICallError,
  ModelMessage,
  stepCountIs,
  streamText,
  TextStreamPart,
  ToolSet,
} from 'ai';
import { AGENT_CONFIG } from '../agent/agent-config';
import { SYSTEM_PROMPT } from '../agent/system-prompt';
import { ChatItem } from '../types';
import { AiAuthService } from './ai-auth.service';
import { DiagramAgentToolsService } from './diagram-agent-tools.service';
import { buildAgentTools } from './tools';

/**
 * Drives the chat conversation: takes a user prompt, calls OpenRouter via the
 * Vercel AI SDK with the tool registry from `buildAgentTools`, streams the
 * assistant text into the chat panel, and lets the SDK manage the multi-step
 * tool-use loop via `stopWhen: stepCountIs(maxSteps)`.
 *
 * Provided by DiagramComponent because it depends on
 * DiagramAgentToolsService, which is itself scoped to ng-diagram services.
 */
@Injectable()
export class AiAgentService {
  private readonly auth = inject(AiAuthService);
  private readonly toolRunner = inject(DiagramAgentToolsService);

  private readonly _items = signal<ChatItem[]>([]);
  readonly items = this._items.asReadonly();

  private readonly _isRunning = signal(false);
  readonly isRunning = this._isRunning.asReadonly();

  /** API conversation history we hand back to the model on every iteration. */
  private history: ModelMessage[] = [];

  /** Used to abort an in-flight stream when the user resets / closes. */
  private abortController: AbortController | null = null;

  readonly hasMessages = computed(() => this._items().length > 0);

  reset() {
    this.abortController?.abort();
    this.abortController = null;
    this.history = [];
    this._items.set([]);
    this._isRunning.set(false);
  }

  async send(userText: string) {
    const text = userText.trim();
    if (!text) return;
    if (this._isRunning()) return;

    const apiKey = this.auth.apiKey();
    if (!apiKey) {
      this.append({
        kind: 'error',
        id: this.uid(),
        text: 'Set an OpenRouter API key first.',
      });
      return;
    }

    this.append({ kind: 'user', id: this.uid(), text });
    this.history.push({ role: 'user', content: text });

    this._isRunning.set(true);
    this.abortController = new AbortController();
    const abortSignal = this.abortController.signal;

    try {
      const provider = createOpenRouter({ apiKey });
      const tools = buildAgentTools(this.toolRunner);
      await this.runStream(provider, tools, abortSignal);
    } catch (err) {
      this.handleError(err);
    } finally {
      this._isRunning.set(false);
      this.abortController = null;
    }
  }

  private async runStream(
    provider: ReturnType<typeof createOpenRouter>,
    tools: ToolSet,
    abortSignal: AbortSignal,
  ) {
    // The SDK runs the multi-step tool-use loop internally and streams every
    // text/tool event as a single concatenated stream. We track the current
    // assistant bubble so we can append text deltas in place.
    let assistantId: string | null = null;

    const result = streamText({
      model: provider.chat(AGENT_CONFIG.model),
      system: SYSTEM_PROMPT,
      messages: this.history,
      tools,
      stopWhen: stepCountIs(AGENT_CONFIG.maxSteps),
      maxOutputTokens: AGENT_CONFIG.maxTokens,
      abortSignal,
      // Don't auto-retry — every retry is another visible request, and free
      // models hit shared upstream rate limits that don't recover in seconds.
      // Surface the failure so the user can switch models or wait.
      maxRetries: 0,
    });

    for await (const part of result.fullStream as AsyncIterable<TextStreamPart<ToolSet>>) {
      switch (part.type) {
        case 'text-start': {
          assistantId = this.uid();
          this.append({ kind: 'assistant', id: assistantId, text: '', pending: true });
          break;
        }
        case 'text-delta': {
          if (!assistantId) {
            assistantId = this.uid();
            this.append({ kind: 'assistant', id: assistantId, text: '', pending: true });
          }
          const delta = part.text ?? '';
          if (delta) {
            this.appendAssistantText(assistantId, delta);
          }
          break;
        }
        case 'text-end': {
          if (assistantId) {
            // Drop empty bubbles (model emitted only tool calls in this step).
            if (this.itemText(assistantId).trim() === '') {
              this.removeItem(assistantId);
            } else {
              this.markAssistantDone(assistantId);
            }
            assistantId = null;
          }
          break;
        }
        case 'tool-call': {
          this.append({
            kind: 'tool-call',
            id: part.toolCallId,
            name: part.toolName,
            input: part.input,
            status: 'pending',
          });
          break;
        }
        case 'tool-result': {
          this.updateToolCall(part.toolCallId, {
            status: 'success',
            result: this.serialize(part.output),
          });
          break;
        }
        case 'tool-error': {
          const message =
            part.error instanceof Error ? part.error.message : String(part.error);
          this.updateToolCall(part.toolCallId, { status: 'error', result: message });
          break;
        }
        case 'error': {
          this.handleError(part.error);
          break;
        }
        // Ignore other events (start, finish-step, finish, reasoning, etc.) —
        // we only care about user-facing surface.
      }
    }

    // Persist the full assistant turn (text + tool calls + tool results) so
    // the next user prompt sees the same conversation history the model did.
    const assistantMessages = (await result.response).messages;
    this.history.push(...assistantMessages);
  }

  private handleError(err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') return;

    const detail = this.formatError(err);
    this.append({ kind: 'error', id: this.uid(), text: detail });
  }

  private formatError(err: unknown): string {
    const isFreeModel = AGENT_CONFIG.model.endsWith(':free');
    const inner = this.unwrap(err);

    if (inner instanceof APICallError) {
      const status = inner.statusCode;
      if (status === 401) return 'Invalid OpenRouter API key.';
      if (status === 402) return 'Insufficient OpenRouter credits — add credit at openrouter.ai/credits.';
      if (status === 403) return 'API key lacks permission for this model.';
      if (status === 429) {
        if (isFreeModel) {
          return (
            `Rate limited on ${AGENT_CONFIG.model}. Free OpenRouter models share an upstream pool that throttles fast. ` +
            `Fixes (any of): wait 1–2 minutes, switch to a paid model (e.g. anthropic/claude-haiku-4.5) in agent-config.ts, ` +
            `or add your own provider key at openrouter.ai/settings/integrations to use your personal quota.`
          );
        }
        return 'Rate limited — wait a moment and try again.';
      }
      if (status && status >= 500) return 'OpenRouter is having trouble — retry in a moment.';
    }

    return err instanceof Error ? err.message : String(err);
  }

  /** AI_RetryError wraps the underlying APICallError on `lastError`. */
  private unwrap(err: unknown): unknown {
    if (err && typeof err === 'object' && 'lastError' in err) {
      return (err as { lastError: unknown }).lastError ?? err;
    }
    return err;
  }

  // ------------ chat-state helpers ------------

  private append(item: ChatItem) {
    this._items.update((list) => [...list, item]);
  }

  private removeItem(id: string) {
    this._items.update((list) => list.filter((x) => x.id !== id));
  }

  private appendAssistantText(id: string, delta: string) {
    this._items.update((list) =>
      list.map((x) => (x.id === id && x.kind === 'assistant' ? { ...x, text: x.text + delta } : x)),
    );
  }

  private markAssistantDone(id: string) {
    this._items.update((list) =>
      list.map((x) => (x.id === id && x.kind === 'assistant' ? { ...x, pending: false } : x)),
    );
  }

  private updateToolCall(
    id: string,
    patch: { status: 'success' | 'error'; result?: string },
  ) {
    this._items.update((list) =>
      list.map((x) => (x.id === id && x.kind === 'tool-call' ? { ...x, ...patch } : x)),
    );
  }

  private itemText(id: string): string {
    const item = this._items().find((x) => x.id === id);
    return item && item.kind === 'assistant' ? item.text : '';
  }

  private serialize(value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  private uid(): string {
    return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

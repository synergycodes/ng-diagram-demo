/**
 * Tunable knobs for the AI agent. Edit and reload — values are read every
 * time a request is made.
 */
export const AGENT_CONFIG = {
  /**
   * Model to use, in OpenRouter format ("provider/model"). See
   * https://openrouter.ai/models. Tool-use-capable models recommended:
   *
   *   anthropic/claude-sonnet-4.5
   *   anthropic/claude-haiku-4.5    (cheaper, faster — good for testing)
   *   anthropic/claude-opus-4.1
   *   openai/gpt-4o
   *   openai/gpt-5
   *   google/gemini-2.5-pro
   */
  model: 'tencent/hy3-preview:free',
  /** Per-response output cap. */
  maxTokens: 16000,
  /** Maximum tool-use steps per user turn before the loop is stopped. */
  maxSteps: 12,
};

/** Discriminated union of items that show up in the chat transcript. */
export type ChatItem =
  | { kind: 'user'; id: string; text: string }
  | { kind: 'assistant'; id: string; text: string; pending: boolean }
  | {
      kind: 'tool-call';
      id: string;
      name: string;
      input: unknown;
      status: 'pending' | 'success' | 'error';
      result?: string;
    }
  | { kind: 'error'; id: string; text: string };

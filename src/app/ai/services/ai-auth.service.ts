import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'ngcb.openrouter-api-key';

/**
 * Stores the user's OpenRouter API key in localStorage and exposes it as a
 * signal so the rest of the AI UI can react to login / logout. Keys are kept
 * client-side only — they are never sent anywhere except directly to
 * openrouter.ai.
 */
@Injectable({ providedIn: 'root' })
export class AiAuthService {
  private readonly _apiKey = signal<string | null>(this.read());

  readonly apiKey = this._apiKey.asReadonly();
  readonly isAuthenticated = this._apiKey;

  setKey(key: string) {
    const trimmed = key.trim();
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    this._apiKey.set(trimmed);
  }

  clearKey() {
    localStorage.removeItem(STORAGE_KEY);
    this._apiKey.set(null);
  }

  private read(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
}

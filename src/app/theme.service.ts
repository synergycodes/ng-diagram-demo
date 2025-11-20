import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly _currentTheme = signal<Theme>('light');

  readonly currentTheme = this._currentTheme.asReadonly();

  private mutationObserver?: MutationObserver;

  constructor() {
    this.initializeTheme();
    this.setupThemeObserver();
  }

  private initializeTheme(): void {
    const initialTheme = document.documentElement.getAttribute(
      'data-theme',
    ) as Theme;
    if (initialTheme === 'dark' || initialTheme === 'light') {
      this._currentTheme.set(initialTheme);
    }
  }

  private setupThemeObserver(): void {
    const htmlElement = document.documentElement;

    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-theme'
        ) {
          const newTheme = htmlElement.getAttribute('data-theme') as Theme;
          if (newTheme === 'dark' || newTheme === 'light') {
            this._currentTheme.set(newTheme);
          }
        }
      });
    });

    this.mutationObserver.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  setTheme(theme: Theme): void {
    console.log('CHANGE THEME', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  destroy(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }
}

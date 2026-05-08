import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // 'noop' avoids requiring the optional @angular/animations package — the
    // Material dialog still works, just without enter/leave transitions.
    provideAnimationsAsync('noop'),
  ]
};

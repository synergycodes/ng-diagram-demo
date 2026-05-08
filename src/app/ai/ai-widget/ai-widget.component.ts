import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AiAuthFormComponent } from '../ai-auth-form/ai-auth-form.component';
import { AiChatComponent } from '../ai-chat/ai-chat.component';
import { AiAuthService } from '../services/ai-auth.service';

/**
 * Floating chat widget anchored to the bottom-right of the diagram surface.
 * Closed: shows a single round button. Open: expands into a full chat panel
 * containing either the API-key login form or the conversation UI depending
 * on auth state.
 */
@Component({
  selector: 'app-ai-widget',
  standalone: true,
  imports: [AiAuthFormComponent, AiChatComponent],
  templateUrl: './ai-widget.component.html',
  styleUrls: ['./ai-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiWidgetComponent {
  private readonly auth = inject(AiAuthService);

  isOpen = signal(false);
  isAuthenticated = this.auth.isAuthenticated;

  toggle() {
    this.isOpen.update((v) => !v);
  }

  signOut() {
    this.auth.clearKey();
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiAuthService } from '../services/ai-auth.service';

/**
 * Login screen — collects the user's OpenRouter API key. The key is stored
 * in localStorage and only sent to openrouter.ai directly.
 */
@Component({
  selector: 'app-ai-auth-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ai-auth-form.component.html',
  styleUrls: ['./ai-auth-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiAuthFormComponent {
  private readonly auth = inject(AiAuthService);

  apiKey = signal('');

  submit() {
    const key = this.apiKey().trim();
    if (!key.startsWith('sk-or-')) {
      this.apiKey.set(key);
      return;
    }
    this.auth.setKey(key);
  }
}

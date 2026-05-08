import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiAgentService } from '../services/ai-agent.service';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiChatComponent implements AfterViewChecked {
  protected readonly agent = inject(AiAgentService);

  scrollContainer = viewChild<ElementRef<HTMLElement>>('scroll');
  draft = signal('');

  ngAfterViewChecked(): void {
    const el = this.scrollContainer()?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  send() {
    const text = this.draft().trim();
    if (!text) return;
    this.draft.set('');
    this.agent.send(text);
  }

  reset() {
    this.agent.reset();
  }

  formatToolInput(input: unknown): string {
    return JSON.stringify(input, null, 2);
  }
}

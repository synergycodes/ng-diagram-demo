import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  effect,
  computed,
} from '@angular/core';
import { NavButtonComponent } from '../nav-button/nav-button.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavButtonComponent],
})
export class SidebarComponent {
  private internalCollapsed = signal(false);

  title = input<string>();
  position = input<'left' | 'right'>('left');
  collapsed = input<boolean | undefined>(undefined);

  collapsedChange = output<boolean>();

  isCollapsed = computed(() => {
    const controlledValue = this.collapsed();
    return controlledValue !== undefined
      ? controlledValue
      : this.internalCollapsed();
  });

  constructor() {
    effect(() => {
      const controlledValue = this.collapsed();
      if (controlledValue !== undefined) {
        this.internalCollapsed.set(controlledValue);
      }
    });
  }

  toggleSidebar() {
    const newValue = !this.isCollapsed();

    this.internalCollapsed.set(newValue);

    this.collapsedChange.emit(newValue);
  }
}

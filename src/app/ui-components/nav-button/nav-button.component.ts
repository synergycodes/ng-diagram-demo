import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Size } from '../../types';

@Component({
  selector: 'ngd-nav-button',
  imports: [CommonModule],
  templateUrl: './nav-button.component.html',
  styleUrl: './nav-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  title = input<string>('');
  round = input<boolean>(false);
  active = input<boolean>(false);
  size = input<Size>('large');

  clickAction = output<Event>();
}

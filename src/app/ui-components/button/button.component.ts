import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Size } from '../../types';

type ButtonType =
  | 'primary'
  | 'gray'
  | 'red'
  | 'success'
  | 'warning'
  | 'secondary'
  | 'ghost';

@Component({
  selector: 'ngd-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  buttonType = input<ButtonType>('primary');
  disabled = input<boolean>(false);
  active = input<boolean>(false);
  size = input<Size>('large');
  icon = input<string | null>(null);

  clickAction = output<Event>();
}

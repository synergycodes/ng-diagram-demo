import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavButtonComponent } from '../nav-button/nav-button.component';
import { Size } from '../../types';

export interface SegmentPickerButton {
  id: string;
  icon: string;
  title: string;
}

@Component({
  selector: 'ngd-segment-picker',
  imports: [CommonModule, NavButtonComponent],
  templateUrl: './segment-picker.component.html',
  styleUrl: './segment-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentPickerComponent {
  buttons = input<SegmentPickerButton[]>([]);
  activeButton = input<string>('');
  size = input<Size>('small');
  toggleSwitch = output<void>();
}

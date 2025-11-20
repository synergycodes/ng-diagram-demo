import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { StatusType } from '../../types';

export interface StatusOption {
  value: StatusType;
  label: string;
}

@Component({
  selector: 'app-status-dropdown',
  templateUrl: './status-dropdown.component.html',
  styleUrls: ['./status-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgClass],
})
export class StatusDropdownComponent {
  status = input<StatusType>('pending');
  statusChange = output<StatusType>();

  statuses: StatusOption[] = [
    {
      value: 'pending',
      label: 'Pending',
    },
    {
      value: 'in-progress',
      label: 'In Progress',
    },
    {
      value: 'completed',
      label: 'Completed',
    },
    {
      value: 'blocked',
      label: 'Blocked',
    },
  ];

  onStatusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.statusChange.emit(select.value as StatusType);
  }

  getStatusLabel(): string {
    return (
      this.statuses.find((s) => s.value === this.status())?.label ||
      this.statuses[0].label
    );
  }
}

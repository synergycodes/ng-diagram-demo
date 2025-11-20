import {
  ChangeDetectionStrategy,
  Component,
  output,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { EdgeRoutingName } from 'ng-diagram';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SidebarComponent, FormsModule],
})
export class PropertiesComponent {
  label = input<string | null>('');
  edgeRouting = input<EdgeRoutingName | null>(null);
  edgeLabelPosition = input<number | null>(null);
  enableSnapDrag = input<boolean | null>(null);
  enableSnapResize = input<boolean | null>(null);
  enableSnapRotate = input<boolean | null>(null);
  snapDragStep = input<number | null>(null);
  snapResizeStep = input<number | null>(null);
  snapRotateStep = input<number | null>(null);

  labelChange = output<string>();
  routingChange = output<EdgeRoutingName>();
  labelPositionChange = output<number>();
  snapDragChange = output<boolean>();
  snapResizeChange = output<boolean>();
  snapRotateChange = output<boolean>();
  snapDragStepChange = output<number>();
  snapResizeStepChange = output<number>();
  snapRotateStepChange = output<number>();

  routingOptions: { value: EdgeRoutingName; label: string }[] = [
    { value: 'polyline', label: 'Polyline' },
    { value: 'orthogonal', label: 'Orthogonal' },
    { value: 'bezier', label: 'Bezier' },
  ];

  onInputChange(value: string) {
    this.labelChange.emit(value);
  }

  onRoutingChange(value: EdgeRoutingName) {
    this.routingChange.emit(value);
  }

  onLabelPositionChange(value: string) {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    // Normalize to 0-1 range
    const normalized = Math.max(0, Math.min(1, numValue));
    this.labelPositionChange.emit(normalized);
  }

  onSnapDragChange(value: boolean) {
    this.snapDragChange.emit(value);
  }

  onSnapResizeChange(value: boolean) {
    this.snapResizeChange.emit(value);
  }

  onSnapRotateChange(value: boolean) {
    this.snapRotateChange.emit(value);
  }

  onSnapDragStepChange(value: string) {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;
    this.snapDragStepChange.emit(numValue);
  }

  onSnapResizeStepChange(value: string) {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;
    this.snapResizeStepChange.emit(numValue);
  }

  onSnapRotateStepChange(value: string) {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;
    this.snapRotateStepChange.emit(numValue);
  }
}

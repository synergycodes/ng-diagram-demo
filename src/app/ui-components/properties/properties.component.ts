import {
  ChangeDetectionStrategy,
  Component,
  computed,
  linkedSignal,
  output,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import {
  SegmentPickerButton,
  SegmentPickerComponent,
} from '../segment-picker/segment-picker.component';
import { EdgeLabelPosition, EdgeRoutingName } from 'ng-diagram';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SidebarComponent, FormsModule, SegmentPickerComponent],
})
export class PropertiesComponent {
  collapsed = input(true);
  label = input<string | null>('');
  edgeRouting = input<EdgeRoutingName | null>(null);
  edgeLabelPosition = input<EdgeLabelPosition | null>(null);
  enableSnapDrag = input<boolean | null>(null);
  enableSnapResize = input<boolean | null>(null);
  enableSnapRotate = input<boolean | null>(null);
  snapDragStep = input<number | null>(null);
  snapResizeStep = input<number | null>(null);
  snapRotateStep = input<number | null>(null);
  lockY = input<boolean | null>(null);

  labelChange = output<string>();
  routingChange = output<EdgeRoutingName>();
  labelPositionChange = output<EdgeLabelPosition>();
  snapDragChange = output<boolean>();
  snapResizeChange = output<boolean>();
  snapRotateChange = output<boolean>();
  snapDragStepChange = output<number>();
  snapResizeStepChange = output<number>();
  snapRotateStepChange = output<number>();
  lockYChange = output<boolean>();

  readonly labelPositionButtons: SegmentPickerButton[] = [
    { id: 'relative', icon: 'ph-percent', title: 'Relative - a fraction of the path (0-1)' },
    { id: 'absolute', icon: 'ph-ruler', title: 'Absolute - pixels from the source (negative = from the target)' },
  ];

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

  onLockYChange(value: boolean) {
    this.lockYChange.emit(value);
  }

  /**
   * Position mode follows the current value ('40px' -> absolute, 0.5 -> relative)
   * and can be switched locally; selecting another edge re-derives it.
   */
  labelPositionMode = linkedSignal<'relative' | 'absolute'>(() =>
    typeof this.edgeLabelPosition() === 'string' ? 'absolute' : 'relative',
  );

  /** Numeric value for the input, regardless of mode */
  labelPositionValue = computed<number | null>(() => {
    const position = this.edgeLabelPosition();
    if (position === null) return null;
    return typeof position === 'string' ? parseFloat(position) : position;
  });

  onLabelPositionChange(value: string) {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    if (this.labelPositionMode() === 'absolute') {
      // Pixels along the path from the source; negative counts from the target
      this.labelPositionChange.emit(`${Math.round(numValue)}px`);
      return;
    }

    // Normalize to 0-1 range
    const normalized = Math.max(0, Math.min(1, numValue));
    this.labelPositionChange.emit(normalized);
  }

  onLabelPositionModeToggle() {
    const mode = this.labelPositionMode() === 'relative' ? 'absolute' : 'relative';
    this.labelPositionMode.set(mode);
    // The panel cannot know the edge's path length, so switching modes
    // starts from a sensible default instead of converting the value.
    this.labelPositionChange.emit(mode === 'absolute' ? '40px' : 0.5);
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

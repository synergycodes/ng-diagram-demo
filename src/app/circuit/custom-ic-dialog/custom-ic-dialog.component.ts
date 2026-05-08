import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CircuitNodeType, IcData, IcPin } from '../circuit-types';

interface PackagePreset {
  id: string;
  label: string;
  totalPins: number;
  variant: 'dip' | 'board';
}

const PRESETS: PackagePreset[] = [
  { id: 'dip-8', label: 'DIP-8', totalPins: 8, variant: 'dip' },
  { id: 'dip-14', label: 'DIP-14', totalPins: 14, variant: 'dip' },
  { id: 'dip-16', label: 'DIP-16', totalPins: 16, variant: 'dip' },
  { id: 'dip-20', label: 'DIP-20', totalPins: 20, variant: 'dip' },
  { id: 'dip-28', label: 'DIP-28', totalPins: 28, variant: 'dip' },
  { id: 'dip-40', label: 'DIP-40', totalPins: 40, variant: 'dip' },
  { id: 'board', label: 'Board (custom)', totalPins: 16, variant: 'board' },
];

export interface CustomIcResult {
  data: Omit<IcData, 'reference'>;
  nodeType: CircuitNodeType.Ic | CircuitNodeType.Board;
}

@Component({
  selector: 'app-custom-ic-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './custom-ic-dialog.component.html',
  styleUrls: ['./custom-ic-dialog.component.scss'],
})
export class CustomIcDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CustomIcDialogComponent, CustomIcResult>);

  presets = PRESETS;

  presetId = signal<string>(PRESETS[0].id);
  totalPins = signal<number>(PRESETS[0].totalPins);
  modelName = signal<string>('CUSTOM');
  pinNamesText = signal<string>('');

  preset = computed(() => this.presets.find((p) => p.id === this.presetId())!);
  isCustomPinCount = computed(() => this.preset().id === 'board');

  /** Even split between left and right; left side gets the extra if odd. */
  pinsLeft = computed(() => Math.ceil(this.totalPins() / 2));
  pinsRight = computed(() => this.totalPins() - this.pinsLeft());

  onPresetChange(id: string) {
    this.presetId.set(id);
    const p = this.presets.find((x) => x.id === id)!;
    this.totalPins.set(p.totalPins);
  }

  onPinCountChange(value: string) {
    const n = parseInt(value, 10);
    if (Number.isFinite(n) && n >= 2 && n <= 80) this.totalPins.set(n);
  }

  cancel() {
    this.dialogRef.close();
  }

  create() {
    const preset = this.preset();
    const total = this.totalPins();
    const leftCount = this.pinsLeft();
    const rightCount = this.pinsRight();
    const customNames = this.pinNamesText()
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const pins: IcPin[] = [];
    // Left column: pin 1 → leftCount, top to bottom.
    for (let i = 0; i < leftCount; i++) {
      const number = i + 1;
      pins.push({
        number,
        name: customNames[i] ?? `P${number}`,
        side: 'left',
      });
    }
    // Right column: numbering continues from total down on the right side
    // (DIP convention: pin numbers go counter-clockwise).
    for (let i = 0; i < rightCount; i++) {
      const number = total - i;
      const idx = leftCount + i;
      pins.push({
        number,
        name: customNames[idx] ?? `P${number}`,
        side: 'right',
      });
    }

    const data: Omit<IcData, 'reference'> = {
      label: this.modelName() || 'Custom IC',
      model: this.modelName() || 'Custom IC',
      packageType: preset.label,
      pins,
      variant: preset.variant,
      description: `Custom ${preset.label} IC`,
    };
    const nodeType =
      preset.variant === 'board' ? CircuitNodeType.Board : CircuitNodeType.Ic;
    this.dialogRef.close({ data, nodeType });
  }
}

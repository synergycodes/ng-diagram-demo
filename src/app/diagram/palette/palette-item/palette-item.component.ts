import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CircuitPaletteEntry } from '../../../circuit/palette-data';
import { PaletteItemIconComponent } from '../palette-item-icon/palette-item-icon.component';

/**
 * Card displayed in the palette sidebar — schematic glyph + label + subtitle.
 */
@Component({
  selector: 'app-palette-item',
  templateUrl: './palette-item.component.html',
  styleUrls: ['./palette-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaletteItemIconComponent],
})
export class PaletteItemComponent {
  entry = input.required<CircuitPaletteEntry>();
}

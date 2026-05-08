import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PaletteIconType } from '../../../circuit/palette-icon';

/**
 * Tiny inline-SVG glyph used inside palette cards. One file holds all the
 * variants so adding a new one is a single switch case.
 */
@Component({
  selector: 'app-palette-item-icon',
  templateUrl: './palette-item-icon.component.html',
  styleUrls: ['./palette-item-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaletteItemIconComponent {
  iconType = input.required<PaletteIconType>();
}

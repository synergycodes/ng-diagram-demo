import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgDiagramPaletteItemComponent,
  NgDiagramPaletteItemPreviewComponent,
  NgDiagramViewportService,
} from 'ng-diagram';
import { PaletteItemPreviewComponent } from './palette-item-preview/palette-item-preview.component';
import { PaletteItemComponent } from './palette-item/palette-item.component';
import { SidebarComponent } from '../../ui-components/sidebar/sidebar.component';
import { CircuitPaletteEntry, PALETTE_ENTRIES, groupBySection } from '../../circuit/palette-data';

@Component({
  selector: 'app-palette',
  templateUrl: './palette.component.html',
  styleUrls: ['./palette.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgDiagramPaletteItemComponent,
    NgDiagramPaletteItemPreviewComponent,
    PaletteItemComponent,
    PaletteItemPreviewComponent,
    SidebarComponent,
    FormsModule,
  ],
})
export class PaletteComponent {
  scale = inject(NgDiagramViewportService).scale;

  query = signal('');

  private readonly entries: CircuitPaletteEntry[] = PALETTE_ENTRIES;

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.entries;
    return this.entries.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        e.subtitle.toLowerCase().includes(q) ||
        e.ngItem.data?.label?.toString().toLowerCase().includes(q),
    );
  });

  sections = computed(() => groupBySection(this.filtered()));
}

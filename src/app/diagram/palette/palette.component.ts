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
import { TemplateService } from '../services/template.service';
import { ReferenceCounterService } from '../services/reference-counter.service';

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
  private readonly viewportService = inject(NgDiagramViewportService);
  private readonly templateService = inject(TemplateService);
  private readonly referenceCounter = inject(ReferenceCounterService);

  scale = this.viewportService.scale;

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

  // Templates section (placeholder UI — throwaway, click-to-insert at viewport center).
  templates = this.templateService.describe;

  filteredTemplates = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.templates();
    if (!q) return list;
    return list.filter((t) => t.name.toLowerCase().includes(q));
  });

  onTemplateClick(templateId: string) {
    const center = this.computeViewportCenter();
    const { nodeIds } = this.templateService.expand(templateId, center);
    this.referenceCounter.renumber(nodeIds);
  }

  private computeViewportCenter(): { x: number; y: number } {
    const w = window.innerWidth / 2;
    const h = window.innerHeight / 2;
    return this.viewportService.clientToFlowPosition({ x: w, y: h });
  }
}

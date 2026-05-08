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
import { TEMPLATE_DRAG_MIME } from '../services/template-drag.constants';
import { CustomIcLauncherService } from '../../circuit/custom-ic-launcher.service';

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
  private readonly customIc = inject(CustomIcLauncherService);

  scale = inject(NgDiagramViewportService).scale;

  query = signal('');

  openCustomIc() {
    this.customIc.open();
  }

  private readonly entries: CircuitPaletteEntry[] = PALETTE_ENTRIES;
  private readonly templateService = inject(TemplateService);

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

  // Templates section (placeholder UI; throwaway).
  templates = this.templateService.describe;

  filteredTemplates = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.templates();
    if (!q) return list;
    return list.filter((t) => t.name.toLowerCase().includes(q));
  });

  onTemplateDragStart(event: DragEvent, templateId: string) {
    if (!event.dataTransfer) return;
    event.dataTransfer.setData(TEMPLATE_DRAG_MIME, templateId);
    event.dataTransfer.effectAllowed = 'copy';
  }
}

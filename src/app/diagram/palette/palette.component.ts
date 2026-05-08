import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgDiagramPaletteItemComponent,
  NgDiagramPaletteItemPreviewComponent,
  NgDiagramViewportService,
} from 'ng-diagram';
import { PaletteTab } from '../../circuit/circuit-types';
import { CustomIcLauncherService } from '../../circuit/custom-ic-launcher.service';
import {
  CircuitPaletteEntry,
  groupBySection,
  PALETTE_ENTRIES,
  TABS,
} from '../../circuit/palette-data';
import { SidebarComponent } from '../../ui-components/sidebar/sidebar.component';
import { TEMPLATE_DRAG_MIME } from '../services/template-drag.constants';
import { TemplateService } from '../services/template.service';
import { PaletteItemPreviewComponent } from './palette-item-preview/palette-item-preview.component';
import { PaletteItemComponent } from './palette-item/palette-item.component';

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
  private readonly templateService = inject(TemplateService);

  scale = inject(NgDiagramViewportService).scale;

  readonly tabs = TABS;
  activeTab = signal<PaletteTab>('basic');
  query = signal('');

  private readonly entries: CircuitPaletteEntry[] = PALETTE_ENTRIES;

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const tab = this.activeTab();
    const inTab = this.entries.filter((e) => e.tab === tab);
    if (!q) return inTab;
    return inTab.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        e.subtitle.toLowerCase().includes(q) ||
        e.ngItem.data?.label?.toString().toLowerCase().includes(q),
    );
  });

  sections = computed(() => groupBySection(this.filtered()));

  // User-saved circuit templates — exposed in the palette so they can be
  // dragged onto the canvas like any other component.
  templates = this.templateService.describe;

  filteredTemplates = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.templates();
    if (!q) return list;
    return list.filter((t) => t.name.toLowerCase().includes(q));
  });

  selectTab(tab: PaletteTab) {
    this.activeTab.set(tab);
  }

  openCustomIc() {
    this.customIc.open();
  }

  onTemplateDragStart(event: DragEvent, templateId: string) {
    if (!event.dataTransfer) return;
    event.dataTransfer.setData(TEMPLATE_DRAG_MIME, templateId);
    event.dataTransfer.effectAllowed = 'copy';
  }
}

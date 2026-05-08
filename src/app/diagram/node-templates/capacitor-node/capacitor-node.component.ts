import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  NgDiagramNodeRotateAdornmentComponent,
  NgDiagramNodeSelectedDirective,
  NgDiagramNodeTemplate,
  NgDiagramPortComponent,
  NgDiagramSelectionService,
  NgDiagramViewportService,
  Node,
} from 'ng-diagram';
import { CapacitorData } from '../../../circuit/circuit-types';
import { ContextMenuService } from '../../../ui-components/context-menu/context-menu.service';

@Component({
  selector: 'app-capacitor-node',
  imports: [NgDiagramPortComponent, NgDiagramNodeRotateAdornmentComponent],
  templateUrl: './capacitor-node.component.html',
  styleUrls: ['./capacitor-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: NgDiagramNodeSelectedDirective, inputs: ['node'] }],
  host: { '[class.ng-diagram-port-hoverable-over-node]': 'true' },
})
export class CapacitorNodeComponent implements NgDiagramNodeTemplate<CapacitorData> {
  private readonly contextMenuService = inject(ContextMenuService);
  private readonly viewportService = inject(NgDiagramViewportService);
  private readonly selectionService = inject(NgDiagramSelectionService);

  node = input.required<Node<CapacitorData>>();

  reference = computed(() => this.node()?.data?.reference ?? 'C?');
  value = computed(() => this.node()?.data?.value ?? '');

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const n = this.node();
    if (!n) return;
    const selected = this.selectionService.selection().nodes;
    if (!selected.some((sn) => sn.id === n.id)) {
      this.selectionService.select([n.id]);
    }
    const cursor = this.viewportService.clientToFlowViewportPosition({
      x: event.clientX,
      y: event.clientY,
    });
    this.contextMenuService.showMenu(cursor);
  }
}

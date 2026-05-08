import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  NgDiagramModelService,
  NgDiagramNodeRotateAdornmentComponent,
  NgDiagramNodeSelectedDirective,
  NgDiagramNodeTemplate,
  NgDiagramPortComponent,
  NgDiagramSelectionService,
  NgDiagramViewportService,
  Node,
} from 'ng-diagram';
import { DiodeData } from '../../../circuit/circuit-types';
import { connectedPortIdsSignal } from '../../../circuit/connected-ports';
import { ContextMenuService } from '../../../ui-components/context-menu/context-menu.service';

@Component({
  selector: 'app-diode-node',
  imports: [NgDiagramPortComponent, NgDiagramNodeRotateAdornmentComponent],
  templateUrl: './diode-node.component.html',
  styleUrls: ['./diode-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: NgDiagramNodeSelectedDirective, inputs: ['node'] }],
  host: { '[class.ng-diagram-port-hoverable-over-node]': 'true' },
})
export class DiodeNodeComponent implements NgDiagramNodeTemplate<DiodeData> {
  private readonly contextMenuService = inject(ContextMenuService);
  private readonly viewportService = inject(NgDiagramViewportService);
  private readonly selectionService = inject(NgDiagramSelectionService);
  private readonly modelService = inject(NgDiagramModelService);

  node = input.required<Node<DiodeData>>();

  reference = computed(() => this.node()?.data?.reference ?? 'D?');
  model = computed(() => this.node()?.data?.model ?? '');

  connectedPortIds = connectedPortIdsSignal(this.modelService, computed(() => this.node()?.id));
  isConnected(portId: string): boolean { return this.connectedPortIds().has(portId); }

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

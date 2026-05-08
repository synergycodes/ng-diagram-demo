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
import { BatteryData } from '../../../circuit/circuit-types';
import { connectedPortIdsSignal } from '../../../circuit/connected-ports';
import { ContextMenuService } from '../../../ui-components/context-menu/context-menu.service';

@Component({
  selector: 'app-battery-node',
  imports: [NgDiagramPortComponent, NgDiagramNodeRotateAdornmentComponent],
  templateUrl: './battery-node.component.html',
  styleUrls: ['./battery-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: NgDiagramNodeSelectedDirective, inputs: ['node'] }],
  host: { '[class.ng-diagram-port-hoverable-over-node]': 'true' },
})
export class BatteryNodeComponent implements NgDiagramNodeTemplate<BatteryData> {
  private readonly contextMenuService = inject(ContextMenuService);
  private readonly viewportService = inject(NgDiagramViewportService);
  private readonly selectionService = inject(NgDiagramSelectionService);
  private readonly modelService = inject(NgDiagramModelService);

  node = input.required<Node<BatteryData>>();

  connectedPortIds = connectedPortIdsSignal(this.modelService, computed(() => this.node()?.id));
  isConnected(portId: string): boolean { return this.connectedPortIds().has(portId); }

  reference = computed(() => this.node()?.data?.reference ?? 'BAT?');
  voltage = computed(() => this.node()?.data?.voltage ?? '');

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

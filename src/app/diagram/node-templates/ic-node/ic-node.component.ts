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
import { IcData, IcPin } from '../../../circuit/circuit-types';
import { connectedPortIdsSignal } from '../../../circuit/connected-ports';
import { ContextMenuService } from '../../../ui-components/context-menu/context-menu.service';

interface PositionedPin {
  pin: IcPin;
  /** Y position relative to the node host in pixels. */
  y: number;
}

@Component({
  selector: 'app-ic-node',
  imports: [NgDiagramPortComponent, NgDiagramNodeRotateAdornmentComponent],
  templateUrl: './ic-node.component.html',
  styleUrls: ['./ic-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: NgDiagramNodeSelectedDirective, inputs: ['node'] }],
  host: {
    '[class.ng-diagram-port-hoverable-over-node]': 'true',
    '[class.is-board]': 'isBoard()',
    '[style.width.px]': 'nodeWidth()',
    '[style.height.px]': 'nodeHeight()',
  },
})
export class IcNodeComponent implements NgDiagramNodeTemplate<IcData> {
  private readonly contextMenuService = inject(ContextMenuService);
  private readonly viewportService = inject(NgDiagramViewportService);
  private readonly selectionService = inject(NgDiagramSelectionService);
  private readonly modelService = inject(NgDiagramModelService);

  node = input.required<Node<IcData>>();

  /** Set of port IDs with an attached edge — used to fade them out. */
  connectedPortIds = connectedPortIdsSignal(
    this.modelService,
    computed(() => this.node()?.id),
  );

  isConnected(portId: string): boolean {
    return this.connectedPortIds().has(portId);
  }

  data = computed(() => this.node()?.data);
  isBoard = computed(() => this.data()?.variant === 'board');

  /** Per-variant geometry constants. */
  private readonly geom = computed(() => {
    if (this.isBoard()) {
      return {
        nodeWidth: 232,
        bodyWidth: 220,
        bodyOffsetX: 6,
        bodyTop: 17,
        bodyBottomMargin: 0,
        pinPitch: 24,
        topPadding: 16,
        bottomPadding: 16,
        pinLineLength: 6,
        radius: 8,
        showPin1Marker: false,
      };
    }
    return {
      nodeWidth: 120,
      bodyWidth: 80,
      bodyOffsetX: 20,
      bodyTop: 20,
      bodyBottomMargin: 20,
      pinPitch: 15,
      topPadding: 15,
      bottomPadding: 20,
      pinLineLength: 20,
      radius: 4,
      showPin1Marker: true,
    };
  });

  leftPins = computed(() => this.data()?.pins?.filter((p) => p.side === 'left') ?? []);
  rightPins = computed(() => this.data()?.pins?.filter((p) => p.side === 'right') ?? []);
  maxPinsPerSide = computed(() => Math.max(this.leftPins().length, this.rightPins().length, 1));

  bodyHeight = computed(() => {
    const g = this.geom();
    const n = this.maxPinsPerSide();
    return g.topPadding + g.bottomPadding + Math.max(0, n - 1) * g.pinPitch;
  });

  nodeWidth = computed(() => this.geom().nodeWidth);
  nodeHeight = computed(() => this.geom().bodyTop + this.bodyHeight() + this.geom().bodyBottomMargin);

  bodyOffsetX = computed(() => this.geom().bodyOffsetX);
  bodyOffsetY = computed(() => this.geom().bodyTop);
  bodyWidth = computed(() => this.geom().bodyWidth);
  bodyRadius = computed(() => this.geom().radius);
  showPin1Marker = computed(() => this.geom().showPin1Marker);
  pinLineLength = computed(() => this.geom().pinLineLength);

  leftPositions = computed<PositionedPin[]>(() => this.computePositions(this.leftPins()));
  rightPositions = computed<PositionedPin[]>(() => this.computePositions(this.rightPins()));

  private computePositions(pins: IcPin[]): PositionedPin[] {
    if (pins.length === 0) return [];
    const g = this.geom();
    return pins.map((pin, i) => ({
      pin,
      y: g.bodyTop + g.topPadding + i * g.pinPitch,
    }));
  }

  /** Stable port id derived from the IC pin number. */
  portId(pin: IcPin): string {
    return `pin-${pin.number}`;
  }

  /** Center-of-body Y for the model name label. */
  modelLabelTop = computed(() => this.bodyOffsetY() + this.bodyHeight() / 2 - 6);

  reference = computed(() => this.data()?.reference ?? 'U?');
  model = computed(() => this.data()?.model ?? '');

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

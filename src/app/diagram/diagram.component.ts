/**
 * Main diagram surface for the schematics builder. Hosts the ng-diagram
 * canvas, palette, properties sidebar, navbar, and context menu.
 */

import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  NgDiagramComponent,
  NgDiagramBackgroundComponent,
  NgDiagramMinimapComponent,

  NgDiagramNodeTemplateMap,
  Node,

  NgDiagramService,
  NgDiagramSelectionService,
  NgDiagramModelService,
  NgDiagramViewportService,

  initializeModel,
  provideNgDiagram,
  createMiddlewares,

  DiagramInitEvent,
  EdgeDrawEndedEvent,
  SelectionMovedEvent,
  SelectionGestureEndedEvent,
  SelectionRemovedEvent,
  GroupMembershipChangedEvent,
  SelectionRotatedEvent,
  ViewportChangedEvent,
  ClipboardPastedEvent,
  NodeResizedEvent,
  PaletteItemDroppedEvent,
} from 'ng-diagram';

import { PaletteComponent } from './palette/palette.component';
import { PropertiesComponent } from '../ui-components/properties/properties.component';
import { NavbarComponent, BackgroundType } from '../ui-components/navbar/navbar.component';
import { BaseNodeEdgeData } from '../types';
import { AnyCircuitData, CircuitNodeBaseData, CircuitNodeType } from '../circuit/circuit-types';
import { nodeTemplateMap } from './node-template-map';
import { edgeTemplateMap } from './edge-template-map';
import {
  ContextMenuComponent,
  PasteEvent,
} from '../ui-components/context-menu/context-menu.component';
import { ContextMenuService } from '../ui-components/context-menu/context-menu.service';

import { PropertiesFacadeService } from './services/properties-facade.service';
import { DebugEventsService } from './services/debug-events.service';
import { ContextMenuFacadeService } from './services/context-menu-facade.service';
import { createDiagramConfig } from './services/diagram.config';
import { CustomIcLauncherService } from '../circuit/custom-ic-launcher.service';
import { AiAgentService } from '../ai/services/ai-agent.service';
import { DiagramAgentToolsService } from '../ai/services/diagram-agent-tools.service';
import { AiWidgetComponent } from '../ai/ai-widget/ai-widget.component';

import { horizontalLockMiddleware } from './middlewares/horizontal-lock.middleware';

@Component({
  selector: 'app-diagram',
  imports: [
    CommonModule,
    PaletteComponent,
    PropertiesComponent,
    NgDiagramComponent,
    NgDiagramBackgroundComponent,
    NgDiagramMinimapComponent,
    NavbarComponent,
    ContextMenuComponent,
    AiWidgetComponent,
  ],
  providers: [
    ContextMenuService,
    PropertiesFacadeService,
    DebugEventsService,
    ContextMenuFacadeService,
    CustomIcLauncherService,
    DiagramAgentToolsService,
    AiAgentService,
    provideNgDiagram(),
  ],
  templateUrl: './diagram.component.html',
  styleUrl: './diagram.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramComponent {
  private readonly diagramService = inject(NgDiagramService);
  private readonly diagramSelectionService = inject(NgDiagramSelectionService);
  private readonly diagramModelService = inject(NgDiagramModelService);
  private readonly viewportService = inject(NgDiagramViewportService);

  private readonly contextMenuService = inject(ContextMenuService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly debugEvents = inject(DebugEventsService);
  private readonly contextMenuFacade = inject(ContextMenuFacadeService);

  nodeTemplateMap: NgDiagramNodeTemplateMap = nodeTemplateMap;
  edgeTemplateMap = edgeTemplateMap;

  middlewares = createMiddlewares((defaults) => [horizontalLockMiddleware, ...defaults]);

  backgroundType = signal<BackgroundType>('dots');
  debugMode = this.debugEvents.debugMode;
  // Properties panel stays open — its empty state ("Nothing selected") is
  // intentional UI in the v2 design, not an empty hole worth collapsing.
  propertiesCollapsed = signal(false);

  /**
   * Initial demo schematic — VCC → resistor → LED → GND, plus an NE555 next
   * to it so users can see what an IC looks like.
   */
  model = initializeModel({
    nodes: [
      {
        id: 'vcc1',
        type: CircuitNodeType.Vcc,
        position: { x: 80, y: 80 },
        autoSize: false,
        size: { width: 60, height: 80 },
        data: {
          label: 'VCC',
          reference: 'PWR1',
          netName: '+5V',
          voltage: '5V',
        },
      },
      {
        id: 'r1',
        type: CircuitNodeType.Resistor,
        position: { x: 250, y: 240 },
        autoSize: false,
        size: { width: 140, height: 60 },
        data: {
          label: 'Resistor',
          reference: 'R1',
          value: '220Ω',
          tolerance: '5%',
          powerRating: '0.25W',
          footprint: '0805 (SMD)',
        },
      },
      {
        id: 'led1',
        type: CircuitNodeType.Led,
        position: { x: 460, y: 234 },
        autoSize: false,
        size: { width: 140, height: 72 },
        data: {
          label: 'LED',
          reference: 'LED1',
          color: 'Red',
          forwardVoltage: '2.0V',
        },
      },
      {
        id: 'gnd1',
        type: CircuitNodeType.Gnd,
        position: { x: 690, y: 380 },
        autoSize: false,
        size: { width: 60, height: 80 },
        data: {
          label: 'GND',
          reference: 'GND1',
          netName: 'GND',
        },
      },
      {
        id: 'u1',
        type: CircuitNodeType.Ic,
        position: { x: 850, y: 100 },
        autoSize: false,
        size: { width: 120, height: 120 },
        data: {
          label: 'NE555',
          reference: 'U1',
          model: 'NE555',
          packageType: 'DIP-8',
          supplyVoltage: '4.5V – 16V',
          variant: 'dip',
          pins: [
            { number: 1, name: 'GND', side: 'left', type: 'ground' },
            { number: 2, name: 'TRIG', side: 'left', type: 'input' },
            { number: 3, name: 'OUT', side: 'left', type: 'output' },
            { number: 4, name: 'RST', side: 'left', type: 'input' },
            { number: 5, name: 'CTRL', side: 'right', type: 'input' },
            { number: 6, name: 'THR', side: 'right', type: 'input' },
            { number: 7, name: 'DIS', side: 'right', type: 'output' },
            { number: 8, name: 'VCC', side: 'right', type: 'power' },
          ],
        },
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'r1',
        sourcePort: 'port-b',
        target: 'led1',
        targetPort: 'port-anode',
        sourceArrowhead: undefined,
        targetArrowhead: undefined,
        data: {},
      },
    ],
  });

  config = createDiagramConfig(new Map());

  constructor() {
    effect(() => {
      if (this.diagramService.isInitialized()) {
        this.diagramService.updateConfig({ debugMode: this.debugMode() });
      }
    });
  }

  /** ng-diagram fires this after a palette item is dropped onto the canvas. */
  onPaletteItemDropped(event: PaletteItemDroppedEvent) {
    this.debugEvents.onPaletteItemDropped(event);
    this.assignAutoReference(event.node as Node<AnyCircuitData>);
  }

  private assignAutoReference(node: Node<AnyCircuitData>) {
    const data = node.data as AnyCircuitData & { reference?: string };
    if (!data?.reference) return;

    const match = data.reference.match(/^([A-Za-z]+)\??$/);
    if (!match) return;

    const prefix = match[1];
    const newReference = this.nextReference(prefix, node.id);
    this.diagramModelService.updateNodeData(node.id, { ...data, reference: newReference });
  }

  /** Returns the next free `Prefix<N>` not already used by another node. */
  private nextReference(prefix: string, excludeNodeId?: string): string {
    const re = new RegExp(`^${prefix}(\\d+)$`);
    let max = 0;
    for (const n of this.diagramModelService.nodes() as Node<AnyCircuitData>[]) {
      if (n.id === excludeNodeId) continue;
      const ref = (n.data as AnyCircuitData)?.reference;
      const m = ref?.match(re);
      if (m) max = Math.max(max, Number(m[1]));
    }
    return `${prefix}${max + 1}`;
  }

  // ===================================
  // ng-diagram event handlers (debug logging only — main app reacts via services)
  // ===================================

  onDiagramInit(event: DiagramInitEvent) {
    this.debugEvents.onDiagramInit(event);
    // Ports use data-driven `@for` lists and `[style.top.px]` bindings (for
    // ICs), and class bindings (for connected-port hiding). Per the
    // ng-diagram docs these can race the initial ResizeObserver measurement,
    // producing the "ports unmeasured" warning. A single explicit re-measure
    // after the templates have settled clears it.
    queueMicrotask(() => this.diagramService.invalidateMeasurements());
  }
  onEdgeDrawEnded(event: EdgeDrawEndedEvent) {
    this.debugEvents.onEdgeDrawEnded(event);
  }
  onSelectionMoved(event: SelectionMovedEvent) {
    this.debugEvents.onSelectionMoved(event);
  }
  onSelectionGestureEnded(event: SelectionGestureEndedEvent) {
    this.debugEvents.onSelectionGestureEnded(event);
  }
  onSelectionRemoved(event: SelectionRemovedEvent) {
    this.debugEvents.onSelectionRemoved(event);
  }
  onGroupMembershipChanged(event: GroupMembershipChangedEvent) {
    this.debugEvents.onGroupMembershipChanged(event);
  }
  onSelectionRotated(event: SelectionRotatedEvent) {
    this.debugEvents.onSelectionRotated(event);
  }
  onViewportChanged(event: ViewportChangedEvent) {
    this.debugEvents.onViewportChanged(event);
  }
  onClipboardPasted(event: ClipboardPastedEvent) {
    this.debugEvents.onClipboardPasted(event);
  }
  onNodeResized(event: NodeResizedEvent) {
    this.debugEvents.onNodeResized(event);
  }

  onContextMenuCopy() { this.contextMenuFacade.copy(); }
  onContextMenuCut() { this.contextMenuFacade.cut(); }
  onContextMenuPaste(event: PasteEvent) { this.contextMenuFacade.paste(event); }
  onContextMenuDelete() { this.contextMenuFacade.delete(); }
  onContextMenuBringToFront() { this.contextMenuFacade.bringToFront(); }
  onContextMenuSendToBack() { this.contextMenuFacade.sendToBack(); }

  onDiagramRightClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const cursorPosition = this.viewportService.clientToFlowViewportPosition({
      x: event.clientX,
      y: event.clientY,
    });
    this.contextMenuService.showDiagramMenu(cursorPosition);
  }

  /** Search a node by reference designator (e.g. "R1") or label, then center on it. */
  onSearchNode(query: string) {
    const nodes = this.diagramModelService.nodes() as Node<CircuitNodeBaseData & BaseNodeEdgeData>[];
    const q = query.toLowerCase();
    const found = nodes.find((n) => {
      const ref = n.data.reference?.toLowerCase() ?? '';
      const label = n.data.label?.toLowerCase() ?? '';
      return ref.includes(q) || label.includes(q);
    });
    if (found) {
      this.diagramSelectionService.select([found.id]);
      this.viewportService.centerOnNode(found.id);
    } else {
      this.snackBar.open(`No component found matching "${query}"`, '', { duration: 3000 });
    }
  }
}

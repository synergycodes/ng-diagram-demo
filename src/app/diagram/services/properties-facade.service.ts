import { Injectable, inject, computed } from '@angular/core';
import {
  Edge,
  EdgeRoutingName,
  NgDiagramModelService,
  NgDiagramSelectionService,
  NgDiagramService,
  Node,
} from 'ng-diagram';
import { AnyCircuitData, CircuitNodeBaseData, CircuitNodeType } from '../../circuit/circuit-types';

/**
 * Bridges the diagram selection to the right-hand properties sidebar.
 *
 * Exposes the currently selected node (if any) typed as a circuit component,
 * the currently selected edge (if any), plus generic update helpers used by
 * the properties form.
 */
@Injectable()
export class PropertiesFacadeService {
  private readonly selectionService = inject(NgDiagramSelectionService);
  private readonly modelService = inject(NgDiagramModelService);
  private readonly diagramService = inject(NgDiagramService);

  selectedNodes = computed<Node<AnyCircuitData>[]>(() => {
    const sel = this.selectionService.selection();
    return sel.nodes as Node<AnyCircuitData>[];
  });

  selectedNode = computed<Node<AnyCircuitData> | null>(() => this.selectedNodes()[0] ?? null);

  multiSelected = computed(() => this.selectedNodes().length > 1);

  selectedEdge = computed<Edge | null>(() => {
    const sel = this.selectionService.selection();
    return (sel.edges[0] as Edge | undefined) ?? null;
  });

  hasSelection = computed(() => this.selectedNodes().length > 0 || !!this.selectedEdge());

  /** Concrete circuit type of the selected node (if it is a circuit node). */
  selectedNodeType = computed<CircuitNodeType | null>(() => {
    const node = this.selectedNode();
    if (!node?.type) return null;
    const t = node.type as CircuitNodeType;
    return Object.values(CircuitNodeType).includes(t) ? t : null;
  });

  edgeRouting = computed<EdgeRoutingName | null>(() => {
    const edge = this.selectedEdge();
    if (!edge) return null;
    return (
      edge.routing ??
      this.diagramService.config().edgeRouting?.defaultRouting ??
      'orthogonal'
    );
  });

  /**
   * Update a single field on the selected node's data. The key is loosely
   * typed because `AnyCircuitData` is a union of types with disjoint fields —
   * narrowing happens at the call site (the properties form), not here.
   */
  updateNodeField(key: string, value: unknown) {
    const node = this.selectedNode();
    if (!node) return;
    this.modelService.updateNodeData(node.id, { ...node.data, [key]: value });
  }

  updateEdgeRouting(routing: EdgeRoutingName) {
    const edge = this.selectedEdge();
    if (!edge) return;
    this.modelService.updateEdge(edge.id, { routing });
  }

  // Snap controls — kept for power users; only show for nodes.
  enableSnapDrag = computed(() => this.readNodeFlag('enableSnapDrag', false));
  enableSnapResize = computed(() => this.readNodeFlag('enableSnapResize', false));
  enableSnapRotate = computed(() => this.readNodeFlag('enableSnapRotate', false));
  snapDragStep = computed(() => this.readNodeFlag('snapDragStep', 10));
  snapResizeStep = computed(() => this.readNodeFlag('snapResizeStep', 10));
  snapRotateStep = computed(() => this.readNodeFlag('snapRotateStep', 30));

  private readNodeFlag<T>(key: keyof CircuitNodeBaseData, fallback: T): T {
    const node = this.selectedNode();
    if (!node) return fallback;
    const val = (node.data as CircuitNodeBaseData)[key] as T | undefined;
    return val ?? fallback;
  }
}

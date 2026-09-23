import { Injectable, inject, computed, signal } from '@angular/core';
import {
  NgDiagramSelectionService, // Service for managing node and edge selection
  NgDiagramModelService, // Service for updating diagram model (nodes, edges, data)
  NgDiagramService, // Core service for accessing diagram configuration
  Node,
  Edge,
  EdgeRoutingName, // Type for edge routing algorithms: 'orthogonal', 'polyline', 'bezier'
  EdgeLabelPosition, // number (0-1 fraction) or 'Npx' (absolute; negative = from the target)
  SelectionGestureEndedEvent,
} from 'ng-diagram';
import { BaseNodeEdgeData, DecisionOption, MAX_DECISION_OPTIONS } from '../../types';
import { NodeTemplateType } from '../node-templates/node-template.types';

/** Node data shape the decision node reads - see decision-node.component.ts */
type DecisionNodeData = BaseNodeEdgeData & { options?: DecisionOption[] };


/**
 * PropertiesFacadeService
 *
 * It showcases how to:
 * - Use NgDiagramSelectionService to read the current selection
 * - Use NgDiagramModelService to update node and edge data
 * - Create computed signals that react to selection changes
 */
@Injectable()
export class PropertiesFacadeService {
  // Inject ng-diagram services for selection and model management
  private readonly selectionService = inject(NgDiagramSelectionService);
  private readonly modelService = inject(NgDiagramModelService);
  private readonly diagramService = inject(NgDiagramService);

  /**
   * Computed signal for the label of the currently selected node or edge
   *
   */
  label = computed(() => {
    const selection = this.selectionService.selection();
    const selectedItem = (selection.nodes[0] ?? selection.edges[0]) as
      | Node<BaseNodeEdgeData>
      | Edge<BaseNodeEdgeData>
      | null;

    return selectedItem ? selectedItem.data.label || '' : null;
  });

  /**
   * Computed signal for the routing algorithm of the selected edge
   */
  edgeRouting = computed<EdgeRoutingName | null>(() => {
    const selection = this.selectionService.selection();
    const edge = selection.edges[0];
    if (!edge) return null;
    return (
      edge.routing ??
      this.diagramService.config().edgeRouting?.defaultRouting ??
      'orthogonal'
    );
  });

  /**
   * Computed signal for the position of the label on the selected edge
   *
   * Range: 0.0 (at source) to 1.0 (at target), default 0.5 (center)
   * Only shown when edge has a label and a type
   *
   * Note: Label positioning is only possible for custom edge templates currently,
   * not for the default edges. An edge must have a 'type' property to use a custom
   * edge template (defined in edgeTemplateMap).
   */
  edgeLabelPosition = computed<EdgeLabelPosition | null>(() => {
    const selection = this.selectionService.selection();
    const edge = selection.edges[0] as Edge<BaseNodeEdgeData> | undefined;
    if (!edge || !edge.data.label || !edge.type) return null;
    return edge.data.positionOnEdge ?? 0.5;
  });

  // Snapping configuration computed signals
  // These demonstrate how to store per-node configuration in node.data
  // and use it with ng-diagram's snapping system

  /**
   * Whether snap-to-grid is enabled when dragging this node
   *
   * ng-diagram's snapping system uses shouldSnapDragForNode callback
   * in the diagram config to check this value
   */
  enableSnapDrag = computed<boolean | null>(() => {
    const selection = this.selectionService.selection();
    const node = selection.nodes[0] as Node<BaseNodeEdgeData> | undefined;
    if (!node) return null;
    return node.data.enableSnapDrag ?? false;
  });

  /**
   * Whether snap-to-grid is enabled when resizing this node
   */
  enableSnapResize = computed<boolean | null>(() => {
    const selection = this.selectionService.selection();
    const node = selection.nodes[0] as Node<BaseNodeEdgeData> | undefined;
    if (!node) return null;
    return node.data.enableSnapResize ?? false;
  });

  /**
   * Whether snap-to-angle is enabled when rotating this node
   */
  enableSnapRotate = computed<boolean | null>(() => {
    const selection = this.selectionService.selection();
    const node = selection.nodes[0] as Node<BaseNodeEdgeData> | undefined;
    // The group template has no rotate adornment, so hide the rotate controls for groups
    if (!node || ('isGroup' in node && node.isGroup === true)) return null;
    return node.data.enableSnapRotate ?? false;
  });

  /**
   * Whether the horizontal-lock middleware pins this node's Y position
   * (see diagram/middlewares/horizontal-lock.middleware.ts)
   */
  lockY = computed<boolean | null>(() => {
    const selection = this.selectionService.selection();
    const node = selection.nodes[0] as Node<BaseNodeEdgeData> | undefined;
    // Groups are containers - the demo constraint applies to regular nodes only
    if (!node || ('isGroup' in node && node.isGroup === true)) return null;
    return node.data.lockY ?? false;
  });

  /**
   * Grid size for snapping during drag operations (in pixels)
   * Default: 10px
   */
  snapDragStep = computed<number | null>(() => {
    const selection = this.selectionService.selection();
    const node = selection.nodes[0] as Node<BaseNodeEdgeData> | undefined;
    if (!node) return null;
    return node.data.snapDragStep ?? 10;
  });

  /**
   * Grid size for snapping during resize operations (in pixels)
   * Default: 10px
   */
  snapResizeStep = computed<number | null>(() => {
    const selection = this.selectionService.selection();
    const node = selection.nodes[0] as Node<BaseNodeEdgeData> | undefined;
    if (!node) return null;
    return node.data.snapResizeStep ?? 10;
  });

  /**
   * Angle step for snapping during rotation (in degrees)
   * Default: 30 degrees (12 positions around the circle)
   */
  snapRotateStep = computed<number | null>(() => {
    const selection = this.selectionService.selection();
    const node = selection.nodes[0] as Node<BaseNodeEdgeData> | undefined;
    if (!node || ('isGroup' in node && node.isGroup === true)) return null;
    return node.data.snapRotateStep ?? 30;
  });

  /**
   * Computed signal for the branches on the selected decision node
   *
   * Returns null for any other selection, which hides the list in the panel
   * (the same pattern the routing and snapping fields use).
   */
  decisionOptions = computed<DecisionOption[] | null>(() => {
    const selection = this.selectionService.selection();
    const node = selection.nodes[0] as Node<DecisionNodeData> | undefined;
    if (!node || node.type !== NodeTemplateType.Decision) return null;
    return node.data.options ?? [];
  });

  /**
   * Update the label of the currently selected node or edge
   *
   * This demonstrates:
   * - Using NgDiagramModelService.updateNodeData() to update node custom data
   * - Using NgDiagramModelService.updateEdgeData() to update edge custom data
   */
  updateLabel(label: string) {
    const { nodes, edges } = this.selectionService.selection();
    const node = nodes[0];
    const edge = edges[0];

    if (node) {
      this.modelService.updateNodeData(node.id, { ...node.data, label });
      return;
    }

    if (edge) {
      this.modelService.updateEdgeData(edge.id, { ...edge.data, label });
    }
  }

  /**
   * The selected node, but only when it is a decision node
   */
  private selectedDecisionNode(): Node<DecisionNodeData> | null {
    const { nodes } = this.selectionService.selection();
    const node = nodes[0] as Node<DecisionNodeData> | undefined;
    if (!node || node.type !== NodeTemplateType.Decision) return null;
    return node;
  }

  /**
   * Append a branch to the selected decision node
   *
   * Capped at MAX_DECISION_OPTIONS; the panel disables its button at the same
   * limit, so hitting this guard means the two drifted apart.
   */
  addDecisionOption() {
    const node = this.selectedDecisionNode();
    if (!node) return;

    const current = node.data.options ?? [];
    if (current.length >= MAX_DECISION_OPTIONS) return;

    const index = this.nextOptionIndex(new Set(current.map((option) => option.id)));
    this.modelService.updateNodeData(node.id, {
      ...node.data,
      options: [...current, { id: `option-${index}`, label: `Option ${index}` }],
    });
  }

  /**
   * Rename one branch of the selected decision node
   *
   * Only the label changes - the id stays put because it is the port id that
   * any already-drawn edge refers to.
   */
  renameDecisionOption(id: string, label: string) {
    const node = this.selectedDecisionNode();
    if (!node) return;

    const current = node.data.options ?? [];
    if (!current.some((option) => option.id === id)) return;

    this.modelService.updateNodeData(node.id, {
      ...node.data,
      options: current.map((option) => (option.id === id ? { ...option, label } : option)),
    });
  }

  /**
   * Remove one branch from the selected decision node
   *
   * Because each option renders its own port, dropping an option would leave
   * any edge drawn from that port pointing at a port that no longer exists.
   * The edge removal and the option update are committed together in a single
   * transaction, so the model is never observed in that state.
   *
   * This demonstrates:
   * - NgDiagramModelService.getConnectedEdges() to find a node's edges
   * - NgDiagramModelService.deleteEdges() to remove them
   * - NgDiagramService.transaction() to apply both changes atomically
   */
  async removeDecisionOption(id: string) {
    const node = this.selectedDecisionNode();
    if (!node) return;

    const current = node.data.options ?? [];
    if (!current.some((option) => option.id === id)) return;

    // Edges drawn from the removed option's port would dangle - collect them for removal
    const staleEdgeIds = this.modelService
      .getConnectedEdges(node.id)
      .filter((edge) => edge.source === node.id && edge.sourcePort === id)
      .map((edge) => edge.id);

    // One atomic commit - the model is never seen with an edge whose port has gone
    await this.diagramService.transaction(() => {
      if (staleEdgeIds.length > 0) {
        this.modelService.deleteEdges(staleEdgeIds);
      }

      this.modelService.updateNodeData(node.id, {
        ...node.data,
        options: current.filter((option) => option.id !== id),
      });
    });
  }

  /**
   * Lowest index whose generated id is not already taken.
   * Ids must stay unique - they are used as port ids and as @for track keys.
   */
  private nextOptionIndex(usedIds: Set<string>): number {
    let index = usedIds.size + 1;
    while (usedIds.has(`option-${index}`)) index++;
    return index;
  }

  /**
   * Update the routing algorithm for the selected edge
   *
   * This demonstrates:
   * - Using NgDiagramModelService.updateEdge() to update core edge properties
   * - The 'routing' property is a built-in edge property (not in edge.data)
   */
  updateRouting(routing: EdgeRoutingName) {
    const { edges } = this.selectionService.selection();
    const edge = edges[0];

    if (edge) {
      this.modelService.updateEdge(edge.id, { routing });
    }
  }

  /**
   * Update the position of the label on the selected edge
   *
   * Accepts ng-diagram's EdgeLabelPosition union:
   * - number 0.0 (at source) to 1.0 (at target) - a fraction of the path
   * - 'Npx' string - absolute pixels from the source; negative counts from the target
   * This is stored in edge.data (custom property)
   */
  updateLabelPosition(positionOnEdge: EdgeLabelPosition) {
    const { edges } = this.selectionService.selection();
    const edge = edges[0];

    if (edge) {
      this.modelService.updateEdgeData(edge.id, {
        ...edge.data,
        positionOnEdge,
      });
    }
  }

  // Snapping configuration update methods
  // These demonstrate how to update per-node configuration stored in node.data

  /**
   * Toggle snap-to-grid for dragging the selected node
   * The diagram config's shouldSnapDragForNode callback will read this value
   */
  updateSnapDrag(enableSnapDrag: boolean) {
    const { nodes } = this.selectionService.selection();
    const node = nodes[0];

    if (node) {
      this.modelService.updateNodeData(node.id, {
        ...node.data,
        enableSnapDrag,
      });
    }
  }

  /**
   * Toggle snap-to-grid for resizing the selected node
   */
  updateSnapResize(enableSnapResize: boolean) {
    const { nodes } = this.selectionService.selection();
    const node = nodes[0];

    if (node) {
      this.modelService.updateNodeData(node.id, {
        ...node.data,
        enableSnapResize,
      });
    }
  }

  /**
   * Toggle snap-to-angle for rotating the selected node
   */
  updateSnapRotate(enableSnapRotate: boolean) {
    const { nodes } = this.selectionService.selection();
    const node = nodes[0];

    if (node) {
      this.modelService.updateNodeData(node.id, {
        ...node.data,
        enableSnapRotate,
      });
    }
  }

  /**
   * Toggle the horizontal-lock middleware for the selected node
   * The middleware reads this value from node.data on every move
   */
  updateLockY(lockY: boolean) {
    const { nodes } = this.selectionService.selection();
    const node = nodes[0];

    if (node) {
      this.modelService.updateNodeData(node.id, { ...node.data, lockY });
    }
  }

  /**
   * Update the grid size for snap-to-grid during drag
   */
  updateSnapDragStep(snapDragStep: number) {
    const { nodes } = this.selectionService.selection();
    const node = nodes[0];

    if (node) {
      this.modelService.updateNodeData(node.id, {
        ...node.data,
        snapDragStep,
      });
    }
  }

  /**
   * Update the grid size for snap-to-grid during resize
   */
  updateSnapResizeStep(snapResizeStep: number) {
    const { nodes } = this.selectionService.selection();
    const node = nodes[0];

    if (node) {
      this.modelService.updateNodeData(node.id, {
        ...node.data,
        snapResizeStep,
      });
    }
  }

  /**
   * Update the angle step for snap-to-angle during rotation
   */
  updateSnapRotateStep(snapRotateStep: number) {
    const { nodes } = this.selectionService.selection();
    const node = nodes[0];

    if (node) {
      this.modelService.updateNodeData(node.id, {
        ...node.data,
        snapRotateStep,
      });
    }
  }
}

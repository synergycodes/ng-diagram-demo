import { Injectable, inject, computed } from '@angular/core';
import {
  NgDiagramSelectionService, // Service for managing node and edge selection
  NgDiagramModelService, // Service for updating diagram model (nodes, edges, data)
  NgDiagramService, // Core service for accessing diagram configuration
  Node,
  Edge,
  EdgeRoutingName, // Type for edge routing algorithms: 'orthogonal', 'polyline', 'bezier'
} from 'ng-diagram';
import { BaseNodeEdgeData } from '../../types';

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
   * This demonstrates:
   * - Using NgDiagramSelectionService.selection() to get current selection
   * - Supporting both nodes and edges with the same property
   * - Returning null when nothing is selected (to hide the property in UI)
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
  edgeLabelPosition = computed<number | null>(() => {
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
    if (!node) return null;
    return node.data.enableSnapRotate ?? false;
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
    if (!node) return null;
    return node.data.snapRotateStep ?? 30;
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
   * Range: 0.0 (at source) to 1.0 (at target)
   * This is stored in edge.data (custom property)
   */
  updateLabelPosition(positionOnEdge: number) {
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

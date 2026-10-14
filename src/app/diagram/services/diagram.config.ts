import { NgDiagramConfig, Node, Edge } from 'ng-diagram';
import { BaseNodeEdgeData, GroupNodeData } from '../../types';
import { COLLAPSED_GROUP_SIZE } from './group-collapse.service';

/**
 * Create ng-diagram configuration
 *
 * NgDiagramConfig is the main configuration object for customizing diagram behavior.
 *
 * This configuration example uses per-node settings stored in node.data, allowing different
 * nodes to have different snapping behavior.
 *
 * @param minNodeSizes Map of node type to minimum size (width, height)
 * @returns Complete NgDiagramConfig object
 */
export function createDiagramConfig(
  minNodeSizes: Map<string, { width: number; height: number }>
): NgDiagramConfig {
  return {
    // Zoom Configuration
    // Controls zoom limits and initial viewport behavior
    zoom: {
      max: 2, // Maximum zoom level (2.0 = 200%)
      zoomToFit: {
        onInit: true, // Automatically fit all content in view on diagram init
        padding: [100, 50, 50, 300] // Padding around content when fitting to view [top, right, bottom, left] in pixels
      }
    },

    // Background Configuration
    // Configures the dotted grid background
    background: {
      dotSpacing: 40, // Distance between grid dots in pixels (at 100% zoom)
    },

    // Snapping Configuration
    // Controls snap-to-grid behavior during drag and resize operations
    snapping: {
      shouldSnapDragForNode: (node: Node<BaseNodeEdgeData>) =>
        node.data.enableSnapDrag ?? false,

      shouldSnapResizeForNode: (node: Node<BaseNodeEdgeData>) =>
        node.data.enableSnapResize ?? false,

      // Callback: What is the grid size for dragging this node?
      // Returns the snap step (grid cell size) for each axis
      computeSnapForNodeDrag: (node: Node<BaseNodeEdgeData>) => {
        const step = node.data.snapDragStep ?? 10;
        return { width: step, height: step };
      },

      // Callback: What is the grid size for resizing this node?
      computeSnapForNodeSize: (node: Node<BaseNodeEdgeData>) => {
        const step = node.data.snapResizeStep ?? 10;
        return { width: step, height: step };
      },
    },

    // Node Rotation Configuration
    // Controls snap-to-angle behavior during rotation
    nodeRotation: {
      // Callback: Should this node snap to angles when rotated?
      shouldSnapForNode: (node: Node<BaseNodeEdgeData>) =>
        node.data.enableSnapRotate ?? false,

      // Callback: What angle step to use? (e.g., 30° = 12 positions, 45° = 8 positions)
      computeSnapAngleForNode: (node: Node<BaseNodeEdgeData>) => {
        return node.data.snapRotateStep ?? 30;
      },
    },

    // Resize Configuration
    // Controls minimum node sizes based on node type
    resize: {
      // Callback: What is the minimum size for this node?
      // Uses a map of node types to min sizes, with a default fallback.
      // It is also the min-width/min-height of every node with an explicit size, so a
      // collapsed group gets its collapsed size here - see GroupCollapseService.
      getMinNodeSize: (node: Node<Partial<GroupNodeData>>) =>
        node.data.collapsed
          ? COLLAPSED_GROUP_SIZE
          : (minNodeSizes.get(node.type ?? '') ?? { width: 100, height: 50 }),

      // Keep group members contained: shrinking a group stops at the bounds
      // of its children (with resize snapping, at the nearest snap value that
      // still contains them). The library default is true (members may end up
      // outside the group).
      allowResizeBelowChildrenBounds: false,
    },

    // Grouping Configuration
    // A collapsed group shows only its header - it takes no new members until expanded
    grouping: {
      canGroup: (_node: Node, group: Node<Partial<GroupNodeData>>) => !group.data.collapsed,
    },

    // Z-Index Configuration
    // Controls how nodes and edges are layered against each other
    zIndex: {
      // By default (false) edges render *below* the nodes they connect, which
      // hides the first leg of any edge whose port sits inside the node body
      // rather than on its outer boundary - e.g. the decision node's per-option
      // ports. Drawing edges above their connected nodes keeps them visible.
      edgesAboveConnectedNodes: true,
    },

    // Linking Configuration
    // Customizes edge creation when user draws connections
    linking: {
      // Callback: Modify edge properties before it's added to the model
      // Here we set all newly drawn edges to use 'custom-edge' type
      // This allows using a custom edge component template
      finalEdgeDataBuilder: (edge: Edge) => ({
        ...edge,
        type: 'custom-edge',
      }),

      // Relinking (since 1.4): a selected edge shows a handle at each end that can be
      // dragged onto another port. `true` = both ends, 'source' / 'target' = one end only.
      // An edge overrides this default with its own `relinkable` property
      // (see the "Relinkable ends" field in the properties panel).
      // Toggled at runtime from the navbar - see DiagramComponent.
      defaultRelinkable: true,
    },

    // Dangling Edges Configuration (since 1.4)
    // Edges may have a free end: `source`/`target` set to '' and the anchor stored in
    // `sourcePosition`/`targetPosition`. Toggled at runtime from the navbar.
    danglingEdges: {
      // Master switch: a draw or relink dropped on empty canvas keeps the edge with a free end
      // (instead of discarding the draw / reverting the relink). Also enables
      // NgDiagramModelService.detachEdge() and NgDiagramService.startLinkingFromPosition().
      enabled: true,
      // Deleting a node keeps its edges, anchored where the node's port was
      detachOnNodeDelete: true,
    },
  };
}

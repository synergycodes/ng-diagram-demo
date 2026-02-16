import { NgDiagramConfig, Node, Edge } from 'ng-diagram';
import { BaseNodeEdgeData } from '../../types';

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
      // Uses a map of node types to min sizes, with a default fallback
      getMinNodeSize: (node: Node) =>
        minNodeSizes.get(node.type ?? '') ?? { width: 100, height: 50 },
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
    },
  };
}

import { Middleware } from 'ng-diagram';
import { BaseNodeEdgeData } from '../../types';

/**
 * Horizontal Lock Middleware
 *
 * This middleware demonstrates how to constrain node movement to a single axis.
 * Nodes with label 'horizontal' can only move horizontally (X axis) - their Y position is locked.
 *
 * ng-diagram Middleware Concepts:
 *
 * 1. Middleware Pipeline:
 *    - Intercepts state changes before they reach the model
 *    - Can inspect, transform, validate, or cancel operations
 *    - Executed in registration order
 *
 * 2. Context Object provides:
 *    - initialState: State before any changes
 *    - state: Current state with all changes applied
 *    - helpers: Utility functions for efficient change inspection
 *    - nodesMap/edgesMap: Quick lookup by ID
 *
 * 3. Control Flow:
 *    - Call next() to continue with changes
 *    - Call next(stateUpdate) to modify changes
 *    - Call cancel() to abort the operation
 *    - Return early if middleware shouldn't run
 *
 * 4. State Updates:
 *    - nodesToUpdate: Array of partial node updates with id
 *    - Each update is merged with existing node data
 *
 * Use Cases for Middlewares:
 * - Movement constraints (axis locking, boundaries)
 * - Validation (prevent invalid connections, positions)
 * - Auto-layout (snap to grid, align nodes)
 * - Logging and debugging
 * - Sync with external systems
 */
export const horizontalLockMiddleware: Middleware = {
  name: 'horizontal-lock',

  execute: async (context, next) => {
    // Get all nodes that were moved and filter for nodes with label 'horizontal'
    const movedNodeIds = context.helpers.getAffectedNodeIds(['position']);

    const nodesToConstrain = movedNodeIds
      .map((nodeId) => {
        const updatedNode = context.nodesMap.get(nodeId);
        const originalNode = context.initialNodesMap.get(nodeId);

        // Check if this node has label 'horizontal' and has valid positions
        if (
          updatedNode &&
          originalNode &&
          (updatedNode.data as BaseNodeEdgeData)?.label === 'horizontal' &&
          updatedNode.position &&
          originalNode.position
        ) {
          return {
            id: nodeId,
            position: {
              x: updatedNode.position.x,    // Allow new X position
              y: originalNode.position.y,   // Lock original Y position
            },
          };
        }
        return null;
      })
      .filter((node): node is NonNullable<typeof node> => node !== null);

    // Apply constraints if any were found, otherwise continue normally
    next(nodesToConstrain.length > 0 ? { nodesToUpdate: nodesToConstrain } : undefined);
  },
};

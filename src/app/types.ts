export type Size = 'xlarge' | 'large' | 'medium' | 'small' | 'xsmall';

/**
 * Loose duck-type used by middleware / config callbacks that just need access
 * to common per-node fields (label, snap settings). Each circuit-specific data
 * interface lives in `circuit/circuit-types.ts` and is structurally compatible
 * with this — there is no nominal relationship.
 */
export interface BaseNodeEdgeData {
  label: string;
  positionOnEdge?: number;
  enableSnapDrag?: boolean;
  enableSnapResize?: boolean;
  enableSnapRotate?: boolean;
  snapDragStep?: number;
  snapResizeStep?: number;
  snapRotateStep?: number;
}

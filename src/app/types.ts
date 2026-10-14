import { EdgeLabelPosition } from 'ng-diagram';

export type Size = 'xlarge' | 'large' | 'medium' | 'small' | 'xsmall';

export interface PaletteData extends BaseNodeEdgeData {
  description: string;
  icon: string;
  status?: StatusType;
  options?: DecisionOption[];
}

export interface BaseNodeEdgeData {
  label: string;
  // Relative (0-1 fraction of the path) or absolute ('Npx'; negative = from the target)
  positionOnEdge?: EdgeLabelPosition;
  enableSnapDrag?: boolean;
  enableSnapResize?: boolean;
  enableSnapRotate?: boolean;
  lockY?: boolean;
  snapDragStep?: number;
  snapResizeStep?: number;
  snapRotateStep?: number;
}

export type StatusType = 'pending' | 'in-progress' | 'completed' | 'blocked';

/** A single branch rendered by the decision node */
export interface DecisionOption {
  id: string;
  label: string;
}

/** Upper bound for the decision branch list edited in the properties panel */
export const MAX_DECISION_OPTIONS = 10;

/**
 * Per-edge relinking override shown in the properties panel.
 * 'default' = no `relinkable` on the edge (linking.defaultRelinkable applies),
 * 'both' = true, 'none' = false, 'source' / 'target' = only that end.
 */
export type EdgeRelinkableOption = 'default' | 'both' | 'source' | 'target' | 'none';

/** Which ends of an edge are free (not connected to a node) */
export interface EdgeFreeEnds {
  source: boolean;
  target: boolean;
}

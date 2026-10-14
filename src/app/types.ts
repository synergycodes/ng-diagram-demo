import { EdgeEnd, EdgeLabelPosition } from 'ng-diagram';

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

/**
 * One end of an edge that a collapsed group points at itself, recorded so that
 * exactly this end can be restored when the group expands.
 */
export interface ReroutedEdgeEnd {
  edgeId: string;
  end: EdgeEnd;
  /** Node and port the end was connected to before the group collapsed */
  nodeId: string;
  portId?: string;
}

/** Data of a group node - the collapse state and what expanding restores */
export interface GroupNodeData extends BaseNodeEdgeData {
  collapsed?: boolean;
  /** Size and autoSize of the group before it collapsed */
  expandedSize?: { width: number; height: number };
  expandedAutoSize?: boolean;
  reroutedEdgeEnds?: ReroutedEdgeEnd[];
}

/** Which ends of an edge are free (not connected to a node) */
export interface EdgeFreeEnds {
  source: boolean;
  target: boolean;
}

import { EdgeLabelPosition } from 'ng-diagram';

export type Size = 'xlarge' | 'large' | 'medium' | 'small' | 'xsmall';

export interface PaletteData extends BaseNodeEdgeData {
  description: string;
  icon: string;
  status?: StatusType;
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

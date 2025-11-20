export type Size = 'xlarge' | 'large' | 'medium' | 'small' | 'xsmall';

export interface PaletteData extends BaseNodeEdgeData {
  description: string;
  icon: string;
  status?: StatusType;
}

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

export type StatusType = 'pending' | 'in-progress' | 'completed' | 'blocked';

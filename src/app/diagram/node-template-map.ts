import { NgDiagramNodeTemplateMap } from 'ng-diagram';
import { GroupNodeComponent } from './node-templates/group-node/group-node.component';
import { CustomNodeComponent } from './node-templates/custom-node/custom-node.component';
import { TriggerNodeComponent } from './node-templates/trigger-node/trigger-node.component';
import { NodeTemplateType } from './node-templates/node-template.types';

/**
 * Node Template Map - Maps node types to Angular components
 *
 * This is a critical part of ng-diagram's custom node system.
 *
 * How it works:
 * 1. Each node has a 'type' property (e.g., 'trigger', 'custom', 'group')
 * 2. ng-diagram looks up the type in this map to find the component class
 * 3. The component is dynamically rendered for that node
 * 4. The node data is passed to the component via input signal
 *
 * Usage:
 * Pass this map to the ng-diagram component via [nodeTemplateMap] input:
 * <ng-diagram [nodeTemplateMap]="nodeTemplateMap" />
 *
 * Node Component Requirements:
 * - Must implement NgDiagramNodeTemplate<TData> interface
 * - Must have a 'node' input signal of type Node<TData>
 * - Can use ng-diagram directives like:
 *   - NgDiagramPortComponent for connection points
 *   - NgDiagramNodeResizeAdornmentComponent for resize handles
 *   - NgDiagramNodeRotateAdornmentComponent for rotation handle
 *   - NgDiagramNodeSelectedDirective for selection styling
 *
 * Default Behavior:
 * If a node has no type or type is not in map, ng-diagram uses a default node template
 */
export const nodeTemplateMap = new NgDiagramNodeTemplateMap([
  [NodeTemplateType.Trigger, TriggerNodeComponent],
  [NodeTemplateType.Custom, CustomNodeComponent],
  [NodeTemplateType.Group, GroupNodeComponent],
]);

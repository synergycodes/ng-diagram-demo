import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  GroupNode, // Special node type for groups (extends Node with children property)
  NgDiagramGroupHighlightedDirective, // Directive for highlighting drop zones
  NgDiagramGroupNodeTemplate, // Interface for group node templates
  NgDiagramNodeResizeAdornmentComponent,
  NgDiagramNodeSelectedDirective,
  NgDiagramPortComponent,
  NgDiagramSelectionService,
  NgDiagramViewportService,
} from 'ng-diagram';
import { BaseNodeEdgeData } from '../../../types';
import { ContextMenuService } from '../../../ui-components/context-menu/context-menu.service';

/**
 * GroupNodeComponent - Container node that can hold other nodes
 *
 * This demonstrates ng-diagram's grouping/nesting system.
 *
 * What are Group Nodes?
 * - Special nodes that can contain other nodes (parent-child relationship)
 * - Created by setting isGroup: true in palette item or node definition
 * - Children can be added by:
 *   1. Dragging nodes onto the group
 *   2. Programmatically setting node.groupId
 *
 * Group Node Features:
 * - Visual highlighting when dragging nodes over (drop zone feedback)
 * - Children move with the group
 * - Can be nested (groups within groups)
 *
 * Key Differences from Regular Nodes:
 * 1. Implements NgDiagramGroupNodeTemplate instead of NgDiagramNodeTemplate
 * 2. Receives GroupNode<T> instead of Node<T>
 * 3. Uses NgDiagramGroupHighlightedDirective for drop zone styling
 * 4. Has 'highlighted' property that's true when dragging nodes over
 *
 */
@Component({
  selector: 'app-group-node',
  imports: [
    NgDiagramNodeResizeAdornmentComponent,
    NgDiagramPortComponent,
    NgDiagramNodeSelectedDirective,      // For selection styling
    NgDiagramGroupHighlightedDirective,  // For drop zone highlighting
  ],
  templateUrl: './group-node.component.html',
  styleUrls: ['./group-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ng-diagram-port-hoverable-over-node]': 'true',
  },
})
export class GroupNodeComponent implements NgDiagramGroupNodeTemplate<BaseNodeEdgeData> {
  private readonly contextMenuService = inject(ContextMenuService);
  private readonly viewportService = inject(NgDiagramViewportService);
  private readonly selectionService = inject(NgDiagramSelectionService);

  /**
   * Group node input - receives GroupNode instead of Node
   * GroupNode extends Node with additional property:
   * - highlighted: boolean - true when dragging nodes over the group
   */
  node = input.required<GroupNode<BaseNodeEdgeData>>();

  /** Group title from node data */
  groupTitle = computed(() => this.node().data?.label ?? 'Group');

  /**
   * Whether the group is highlighted (dragging nodes over)
   * Use this for visual feedback to show valid drop zone
   * NgDiagramGroupHighlightedDirective can apply CSS class automatically
   */
  highlighted = computed(() => this.node().highlighted ?? false);

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const currentNode = this.node();
    if (currentNode) {
      const selectedNodes = this.selectionService.selection().nodes;
      if (!selectedNodes.some((n) => n.id === currentNode.id)) {
        this.selectionService.select([currentNode.id]);
      }

      const cursorPosition = this.viewportService.clientToFlowViewportPosition({
        x: event.clientX,
        y: event.clientY,
      });
      this.contextMenuService.showMenu(cursorPosition);
    }
  }
}

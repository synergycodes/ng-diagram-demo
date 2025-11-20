import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  NgDiagramNodeResizeAdornmentComponent,
  NgDiagramNodeRotateAdornmentComponent,
  NgDiagramNodeSelectedDirective,
  NgDiagramNodeTemplate,
  NgDiagramPortComponent,
  NgDiagramModelService, // Service for updating node data
  NgDiagramSelectionService,
  NgDiagramViewportService,
  Node,
} from 'ng-diagram';
import { BaseNodeEdgeData, StatusType } from '../../../types';
import { ContextMenuService } from '../../../ui-components/context-menu/context-menu.service';
import { StatusDropdownComponent } from '../../../ui-components/status-dropdown/status-dropdown.component';

/**
 * Data interface for Custom nodes (Task Status)
 * Extends base data with status tracking
 */
interface CustomNodeData extends BaseNodeEdgeData {
  icon: string;
  description: string;
  status: StatusType; // 'pending' | 'in-progress' | 'completed'
}

/**
 * CustomNodeComponent - Interactive node with status dropdown
 *
 * This demonstrates:
 * - Creating interactive UI elements inside nodes (dropdown)
 * - Updating node data in response to user actions
 * - Using NgDiagramModelService to update the model
 *
 * Key pattern: Interactive Nodes
 * Nodes can contain any Angular component with interactive elements:
 * - Buttons, dropdowns, inputs, etc.
 * - Event handlers that update node data
 * - Use NgDiagramModelService.updateNode() or updateNodeData() to persist changes
 */
@Component({
  selector: 'app-custom-node',
  templateUrl: './custom-node.component.html',
  styleUrls: ['./custom-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgDiagramPortComponent,
    NgDiagramNodeResizeAdornmentComponent,
    NgDiagramNodeRotateAdornmentComponent,
    StatusDropdownComponent, // Custom interactive component
  ],
  hostDirectives: [{ directive: NgDiagramNodeSelectedDirective, inputs: ['node'] }],
  host: {
    '[class.ng-diagram-port-hoverable-over-node]': 'true',
  },
})
export class CustomNodeComponent implements NgDiagramNodeTemplate<CustomNodeData> {
  private readonly modelService = inject(NgDiagramModelService);
  private readonly contextMenuService = inject(ContextMenuService);
  private readonly viewportService = inject(NgDiagramViewportService);
  private readonly selectionService = inject(NgDiagramSelectionService);

  node = input.required<Node<CustomNodeData>>();

  nodeLabel = computed(() => this.node()?.data?.['label'] ?? 'Unknown');
  nodeDescription = computed(() => this.node()?.data?.['description'] ?? 'No description');
  nodeIcon = computed(() => `ph ${this.node()?.data?.['icon'] ?? 'ph-placeholder'}`);
  nodeStatus = computed(() => this.node()?.data?.['status'] ?? 'pending');

  /**
   * Handle status change from dropdown
   *
   * This demonstrates how to update node data in response to UI interactions:
   * 1. Get the current node data
   * 2. Call modelService.updateNode() with new data
   * 3. Spread existing data to preserve other properties
   * 4. Update is reactive - UI updates automatically
   *
   * Note: Using updateNode() instead of updateNodeData() to show
   * the full update pattern. updateNodeData() is a convenience method
   * that just updates the data property.
   */
  onStatusChange(newStatus: StatusType) {
    const currentNode = this.node();
    if (currentNode) {
      this.modelService.updateNode(currentNode.id, {
        data: {
          ...currentNode.data,
          status: newStatus,
        },
      });
    }
  }

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

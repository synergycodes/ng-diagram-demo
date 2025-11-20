import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  NgDiagramNodeResizeAdornmentComponent, // Adds resize handles to node
  NgDiagramNodeRotateAdornmentComponent, // Adds rotation handle to node
  NgDiagramNodeSelectedDirective, // Applies selection styling when node is selected
  NgDiagramNodeTemplate, // Interface that all node templates must implement
  NgDiagramPortComponent, // Connection point for drawing edges
  NgDiagramSelectionService, // Service for managing selection
  NgDiagramViewportService, // Service for coordinate transformation
  Node, // Node type from ng-diagram
} from 'ng-diagram';
import { BaseNodeEdgeData } from '../../../types';
import { ContextMenuService } from '../../../ui-components/context-menu/context-menu.service';

/**
 * Data interface for Trigger nodes
 * Extends base data with trigger-specific properties
 */
interface TriggerNodeData extends BaseNodeEdgeData {
  icon: string;        // Phosphor icon class
  description: string; // Node description text
}

/**
 * TriggerNodeComponent - Custom node template for workflow triggers
 *
 * This demonstrates how to create a custom node component for ng-diagram.
 *
 * Custom Node Component Checklist:
 * ✓ Implement NgDiagramNodeTemplate<TData> interface
 * ✓ Have a 'node' input signal of type Node<TData>
 * ✓ Use OnPush change detection for performance
 * ✓ Import and use ng-diagram directives/components as needed
 *
 * ng-diagram Directives & Components Used:
 *
 * 1. NgDiagramPortComponent:
 *    - Creates connection points for edges
 *    - Place in template where you want ports: <ng-diagram-port />
 *    - Auto-positioned at top/right/bottom/left based on edge direction
 *    - Position can be customized via css
 *
 * 2. NgDiagramNodeResizeAdornmentComponent:
 *    - Adds interactive resize handles
 *    - Only shown when node is selected
 *    - Respects minNodeSize from diagram config
 *
 * 3. NgDiagramNodeRotateAdornmentComponent:
 *    - Adds rotation handle above the node
 *    - Only shown when node is selected
 *    - Respects rotation snapping from diagram config
 *
 * 4. NgDiagramNodeSelectedDirective (host directive):
 *    - Automatically applied as a host directive
 *    - Use for selection styling in CSS
 *
 * Host Configuration:
 * - '[class.ng-diagram-port-hoverable-over-node]': Makes ports animate on hover
 */
@Component({
  selector: 'app-trigger-node',
  imports: [
    NgDiagramPortComponent,           // Connection points for edges
    NgDiagramNodeResizeAdornmentComponent,  // Resize handles
    NgDiagramNodeRotateAdornmentComponent,  // Rotation handle
  ],
  templateUrl: './trigger-node.component.html',
  styleUrls: ['./trigger-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    // Automatically adds selection styling
    { directive: NgDiagramNodeSelectedDirective, inputs: ['node'] }
  ],
  host: {
    // Makes ports animate on node hover
    '[class.ng-diagram-port-hoverable-over-node]': 'true',
  },
})
export class TriggerNodeComponent implements NgDiagramNodeTemplate<TriggerNodeData> {
  private readonly contextMenuService = inject(ContextMenuService);
  private readonly viewportService = inject(NgDiagramViewportService);
  private readonly selectionService = inject(NgDiagramSelectionService);

  /**
   * Node data input - REQUIRED for all node templates
   * ng-diagram passes the node object to this input
   */
  node = input.required<Node<TriggerNodeData>>();

  // Computed signals for reactive data access
  nodeLabel = computed(() => this.node()?.data?.['label'] ?? 'Unknown');
  nodeDescription = computed(() => this.node()?.data?.['description'] ?? 'No description');
  nodeIcon = computed(() => `ph ${this.node()?.data?.['icon'] ?? 'ph-placeholder'}`);

  /**
   * Right-click handler for context menu
   *
   * This demonstrates:
   * 1. Selecting the node if not already selected
   * 2. Converting client coordinates to flow-viewport coordinates
   * 3. Opening a context menu at the cursor position
   *
   * Coordinate conversion:
   * - clientToFlowViewportPosition: Converts screen pixels to diagram viewport pixels
   *   (accounts for pan/zoom but stays in viewport space for UI overlay positioning)
   */
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const currentNode = this.node();
    if (currentNode) {
      // Select this node if not already selected
      const selectedNodes = this.selectionService.selection().nodes;
      if (!selectedNodes.some((n) => n.id === currentNode.id)) {
        this.selectionService.select([currentNode.id]);
      }

      // Convert mouse position to diagram viewport coordinates
      const cursorPosition = this.viewportService.clientToFlowViewportPosition({
        x: event.clientX,
        y: event.clientY,
      });
      this.contextMenuService.showMenu(cursorPosition);
    }
  }
}

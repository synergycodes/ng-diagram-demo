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
import { BaseNodeEdgeData, DecisionOption } from '../../../types';
import { ContextMenuService } from '../../../ui-components/context-menu/context-menu.service';

/**
 * Data interface for Decision nodes
 * Extends base data with decision-specific properties
 */
interface DecisionNodeData extends BaseNodeEdgeData {
  icon: string;               // Phosphor icon class
  description: string;        // Node description text
  options: DecisionOption[];  // Branch options rendered as a list
}

/**
 * DecisionNodeComponent - Custom node template for decision branches
 *
 * This demonstrates rendering a variable-length list from node data:
 * data.options is iterated with @for in the template, one row per option.
 * Every other node template in this demo renders a fixed set of fields.
 *
 * See trigger-node.component.ts for the full explanation of the
 * ng-diagram directives and components used here.
 *
 * Ports:
 * - Only a single 'target' port on the left is declared. Output ports are
 *   intentionally left out so they can be added explicitly later.
 */
@Component({
  selector: 'app-decision-node',
  imports: [
    NgDiagramPortComponent,                 // Connection points for edges
    NgDiagramNodeResizeAdornmentComponent,  // Resize handles
    NgDiagramNodeRotateAdornmentComponent,  // Rotation handle
  ],
  templateUrl: './decision-node.component.html',
  styleUrls: ['./decision-node.component.scss'],
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
export class DecisionNodeComponent implements NgDiagramNodeTemplate<DecisionNodeData> {
  private readonly contextMenuService = inject(ContextMenuService);
  private readonly viewportService = inject(NgDiagramViewportService);
  private readonly selectionService = inject(NgDiagramSelectionService);

  /**
   * Node data input - REQUIRED for all node templates
   * ng-diagram passes the node object to this input
   */
  node = input.required<Node<DecisionNodeData>>();

  // Computed signals for reactive data access
  nodeLabel = computed(() => this.node()?.data?.label ?? 'Unknown');
  nodeDescription = computed(() => this.node()?.data?.description ?? 'No description');
  nodeIcon = computed(() => `ph ${this.node()?.data?.icon ?? 'ph-placeholder'}`);
  nodeOptions = computed(() => this.node()?.data?.options ?? []);

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
      if (!currentNode.selected) {
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

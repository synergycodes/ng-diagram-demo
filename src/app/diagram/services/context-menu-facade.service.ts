import { Injectable, inject } from '@angular/core';
import {
  NgDiagramClipboardService, // Service for copy/cut/paste operations
  NgDiagramSelectionService, // Service for managing selection and deletion
  NgDiagramNodeService, // Service for z-order manipulation (bring to front, send to back)
  NgDiagramViewportService, // Service for coordinate transformation (client <-> flow)
} from 'ng-diagram';
import { PasteEvent } from '../../ui-components/context-menu/context-menu.component';

/**
 * ContextMenuFacadeService
 *
 * This service demonstrates how to implement context menu operations using ng-diagram services.
 * It showcases:
 * - Clipboard operations (copy, cut, paste)
 * - Selection deletion
 * - Z-order manipulation (bring to front, send to back)
 * - Coordinate transformation (client coordinates to flow coordinates)
 *
 * Key ng-diagram concepts:
 * 1. Clipboard: NgDiagramClipboardService manages copy/cut/paste with automatic ID generation
 * 2. Selection: NgDiagramSelectionService provides selection state and deletion
 * 3. Z-order: NgDiagramNodeService controls visual stacking order of nodes
 * 4. Coordinates: NgDiagramViewportService transforms between screen and diagram space
 */
@Injectable()
export class ContextMenuFacadeService {
  private readonly clipboardService = inject(NgDiagramClipboardService);
  private readonly selectionService = inject(NgDiagramSelectionService);
  private readonly nodeService = inject(NgDiagramNodeService);
  private readonly viewportService = inject(NgDiagramViewportService);

  /**
   * Copy selected nodes and edges to clipboard
   *
   * NgDiagramClipboardService stores a snapshot of selected items.
   * The clipboard is internal to ng-diagram (not the system clipboard).
   */
  copy() {
    this.clipboardService.copy();
  }

  /**
   * Cut selected nodes and edges to clipboard
   *
   * This copies the selection and then deletes it.
   * Items can be restored by pasting.
   */
  cut() {
    this.clipboardService.cut();
  }

  /**
   * Paste clipboard contents at a specific position
   *
   * This demonstrates:
   * - Converting client coordinates (mouse position) to flow coordinates
   * - Using NgDiagramViewportService.clientToFlowPosition() for transformation
   * - Pasting with NgDiagramClipboardService which auto-generates new IDs
   *
   * @param event Contains x, y coordinates in client space (screen pixels)
   *
   * Coordinate systems:
   * - Client coordinates: Browser viewport pixels (e.g., mouse event coordinates)
   * - Flow coordinates: Diagram canvas coordinates (account for pan and zoom)
   */
  paste(event: PasteEvent) {
    const position = this.viewportService.clientToFlowPosition({
      x: event.x,
      y: event.y,
    });
    this.clipboardService.paste(position);
  }

  /**
   * Delete selected nodes and edges
   *
   * NgDiagramSelectionService.deleteSelection() removes all selected items.
   * Edges connected to deleted nodes are automatically removed.
   */
  delete() {
    this.selectionService.deleteSelection();
  }

  /**
   * Bring selected nodes to front (top of z-order)
   *
   * Z-order determines which nodes appear on top when overlapping.
   * This moves selected nodes to the highest z-index.
   */
  bringToFront() {
    const selectedNodes = this.selectionService.selection().nodes;
    const nodeIds = selectedNodes.map((node) => node.id);
    if (nodeIds.length > 0) {
      this.nodeService.bringToFront(nodeIds);
    }
  }

  /**
   * Send selected nodes to back (bottom of z-order)
   *
   * This moves selected nodes to the lowest z-index,
   * so they appear behind other nodes.
   */
  sendToBack() {
    const selectedNodes = this.selectionService.selection().nodes;
    const nodeIds = selectedNodes.map((node) => node.id);
    if (nodeIds.length > 0) {
      this.nodeService.sendToBack(nodeIds);
    }
  }
}

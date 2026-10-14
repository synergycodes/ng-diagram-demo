import { Injectable, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  DiagramInitEvent, // Emitted when diagram is initialized and ready
  EdgeDrawEndedEvent, // Emitted when an edge draw gesture ends (success or cancel)
  EdgeRelinkStartedEvent, // Emitted when the user starts dragging an end of an existing edge
  EdgeRelinkEndedEvent, // Emitted when an edge relink gesture ends (success or revert)
  SelectionMovedEvent, // Emitted when selected nodes are dragged
  SelectionGestureEndedEvent, // Emitted when a selection gesture completes (on pointerup)
  SelectionRemovedEvent, // Emitted when selected items are deleted
  GroupMembershipChangedEvent, // Emitted when nodes are added/removed from groups
  SelectionRotatedEvent, // Emitted when a node is rotated
  ViewportChangedEvent, // Emitted when viewport position or zoom changes
  ClipboardPastedEvent, // Emitted when nodes/edges are pasted from clipboard
  NodeResizedEvent, // Emitted when a node is resized
  PaletteItemDroppedEvent, // Emitted when a palette item is dropped onto the canvas
} from 'ng-diagram';
import { BaseNodeEdgeData } from '../../types';

/**
 * DebugEventsService
 *
 * This service demonstrates how to handle all ng-diagram events for debugging purposes.
 *
 * Usage: Wire these methods to ng-diagram event outputs in the template:
 * <ng-diagram
 *   (diagramInit)="debugService.onDiagramInit($event)"
 *   (edgeDrawEnded)="debugService.onEdgeDrawEnded($event)"
 *   ...
 * />
 */
@Injectable()
export class DebugEventsService {
  private readonly snackBar = inject(MatSnackBar);

  // Signal to toggle debug notifications on/off
  debugMode = signal(false);

  /**
   * Lifecycle Event: Diagram Initialization
   *
   * Emitted once when the diagram is fully initialized, all parts measured and ready for interaction.
   * This is a good place to perform initial setup or load saved state.
   *
   * Event data:
   * - Nodes
   * - Edges
   * - Viewport
   */
  onDiagramInit(event: DiagramInitEvent) {
    if (!this.debugMode()) return;
    this.snackBar.open('Diagram initialized', '', { duration: 4000 });
  }

  /**
   * Drawing Event: Edge Draw Ended
   *
   * Emitted when an edge draw gesture ends, regardless of outcome.
   * Fires for both successful and cancelled draws.
   *
   * Event data:
   * - success: Whether the edge was created
   * - edge: The newly created edge object (when successful)
   * - source: Source node (absent for draws started with startLinkingFromPosition)
   * - target: Target node (absent when the edge was kept as a dangling edge)
   * - reason: Cancellation reason (when cancelled)
   * - dropPosition: Where the gesture ended
   *
   * With danglingEdges.enabled, a drop on empty canvas still reports success: true -
   * check event.target to tell a connected edge from a dangling one.
   */
  onEdgeDrawEnded(event: EdgeDrawEndedEvent) {
    if (!this.debugMode()) return;
    if (event.success && event.target) {
      this.snackBar.open(
        `Edge drawn from ${event.source?.id ?? 'a free point'} to ${event.target.id}`,
        '',
        { duration: 4000 }
      );
    } else if (event.success) {
      this.snackBar.open(`Edge kept as a dangling edge: ${event.edge!.id}`, '', {
        duration: 4000,
      });
    } else {
      this.snackBar.open(
        `Edge draw cancelled: ${event.reason}`,
        '',
        { duration: 4000 }
      );
    }
  }

  /**
   * Relinking Event: Edge Relink Started
   *
   * Emitted when the user starts dragging a relink handle of a selected edge
   * (more than ~5px of pointer movement - a plain click on a handle does nothing).
   *
   * Event data:
   * - edge: Snapshot of the edge at gesture start
   * - end: Which end is dragged ('source' | 'target')
   */
  onEdgeRelinkStarted(event: EdgeRelinkStartedEvent) {
    if (!this.debugMode()) return;
    this.snackBar.open(`Relinking ${event.end} end of ${event.edge.id}`, '', {
      duration: 4000,
    });
  }

  /**
   * Relinking Event: Edge Relink Ended
   *
   * Emitted when a relink gesture ends, whatever the outcome.
   *
   * Event data:
   * - edge: The edge after the relink (unchanged snapshot on failure)
   * - end: The dragged end
   * - previousNode / previousPort: Where the end was connected before (if it was)
   * - previousPosition: Where the end was anchored before (if it was free)
   * - target / targetPort: The new connection (on reconnect)
   * - success: Whether the edge changed (reconnected or detached)
   * - reason: 'noTarget' | 'invalidConnection' | 'cancelled' (on failure)
   */
  onEdgeRelinkEnded(event: EdgeRelinkEndedEvent) {
    if (!this.debugMode()) return;
    let message: string;
    if (event.success && event.target) {
      message = `Reconnected ${event.end} of ${event.edge.id} to ${event.target.id}`;
    } else if (event.success) {
      message = `Detached ${event.end} of ${event.edge.id} - now a dangling edge`;
    } else {
      message = `Relink reverted: ${event.reason}`;
    }
    this.snackBar.open(message, '', { duration: 4000 });
  }

  /**
   * Interaction Event: Selection Moved
   *
   * Emitted when selected nodes are dragged to a new position.
   * This fires after the move is complete (on mouse up).
   *
   * Event data:
   * - nodes: Array of nodes that were moved with updated positions
   */
  onSelectionMoved(event: SelectionMovedEvent) {
    if (!this.debugMode()) return;
    const count = event.nodes.length;
    this.snackBar.open(`${count} node(s) moved`, '', { duration: 4000 });
  }

  /**
   * Selection Event: Selection Gesture Ended
   *
   * Emitted when a selection gesture completes (on pointerup after clicking
   * a node/edge, box selection, or select-all).
   * Use this to trigger actions after the user finishes selecting,
   * such as showing toolbars or updating panels.
   *
   * Event data:
   * - nodes: Array of currently selected nodes
   * - edges: Array of currently selected edges
   */
  onSelectionGestureEnded(event: SelectionGestureEndedEvent) {
    if (!this.debugMode()) return;
    const nodeCount = event.nodes.length;
    const edgeCount = event.edges.length;
    this.snackBar.open(
      `Selection: ${nodeCount} node(s), ${edgeCount} edge(s)`,
      '',
      { duration: 4000 }
    );
  }

  /**
   * Selection Event: Items Deleted
   *
   * Emitted when selected nodes and/or edges are deleted.
   * Edges connected to deleted nodes are deleted too - unless
   * danglingEdges.detachOnNodeDelete keeps them as dangling edges.
   *
   * Event data:
   * - deletedNodes: Array of nodes that were deleted
   * - deletedEdges: Array of edges that were deleted (including auto-deleted edges)
   * - detachedEdges: Edges kept as dangling edges instead of deleted ([] when none)
   */
  onSelectionRemoved(event: SelectionRemovedEvent) {
    if (!this.debugMode()) return;
    const nodeCount = event.deletedNodes.length;
    const edgeCount = event.deletedEdges.length;
    const detachedCount = event.detachedEdges.length;
    this.snackBar.open(
      `Deleted ${nodeCount} node(s), ${edgeCount} edge(s), detached ${detachedCount} edge(s)`,
      '',
      { duration: 4000 }
    );
  }

  /**
   * Grouping Event: Group Membership Changed
   *
   * Emitted when nodes are added to or removed from a group node.
   * Groups are special nodes that can contain other nodes (parent-child relationship).
   *
   * Event data:
   * grouped - nodes added to groups, organized by target group
   * ungrouped - nodes removed from groups
   */
  onGroupMembershipChanged(event: GroupMembershipChangedEvent) {
    if (!this.debugMode()) return;
    this.snackBar.open('Group membership changed', '', { duration: 4000 });
  }

  /**
   * Interaction Event: Node Rotated
   *
   * Emitted when a node is rotated using the rotation handle.
   * Rotation is in degrees (0-360).
   *
   * Event data:
   * - nodeId: Rotated node
   * - angle: New rotation angle in degrees
   * - previousAngle: Previous rotation angle
   */
  onSelectionRotated(event: SelectionRotatedEvent) {
    if (!this.debugMode()) return;
    this.snackBar.open(`Node rotated to ${Math.round(event.angle)}°`, '', {
      duration: 4000,
    });
  }

  /**
   * Viewport Event: Pan or Zoom Changed
   *
   * Emitted when the viewport position (pan) or zoom level changes.
   * This can be triggered by user interaction or programmatic changes.
   *
   * Event data:
   * - viewport: Current viewport state
   * - previousViewport: Previous viewport state
   */
  onViewportChanged(event: ViewportChangedEvent) {
    if (!this.debugMode()) return;
    const scale = (event.viewport.scale * 100).toFixed(0);
    this.snackBar.open(
      `Zoom: ${scale}%, Position: ${event.viewport.x}, ${event.viewport.y}`,
      '',
      { duration: 4000 }
    );
  }

  /**
   * Clipboard Event: Paste Completed
   *
   * Emitted after nodes and edges are pasted from the clipboard.
   * The pasted items are duplicates with new IDs.
   *
   * Event data:
   * - nodes: Array of newly created nodes
   * - edges: Array of newly created edges
   */
  onClipboardPasted(event: ClipboardPastedEvent) {
    if (!this.debugMode()) return;
    const nodeCount = event.nodes.length;
    const edgeCount = event.edges.length;
    this.snackBar.open(
      `Pasted ${nodeCount} node(s), ${edgeCount} edge(s)`,
      '',
      { duration: 4000 }
    );
  }

  /**
   * Interaction Event: Node Resized
   *
   * Emitted when a node is resized using resize handles.
   * Not all nodes are resizable - this depends on node configuration.
   *
   * Event data:
   * - node: The resized node with updated size
   * - previousSize: { width, height } - Size before resize
   */
  onNodeResized(event: NodeResizedEvent) {
    if (!this.debugMode()) return;
    const size = event.node.size;
    if (!size) return;
    const width = Math.round(size.width);
    const height = Math.round(size.height);
    this.snackBar.open(`Node resized to ${width}×${height}`, '', {
      duration: 4000,
    });
  }

  /**
   * Palette Event: Item Dropped from Palette
   *
   * Emitted when a user drags an item from the palette and drops it on the canvas.
   *
   * Event data:
   * - node: The newly created node
   * - dropPosition: { x, y } - Where the node was dropped (in flow coordinates)
   */
  onPaletteItemDropped(event: PaletteItemDroppedEvent) {
    if (!this.debugMode()) return;
    const label = (event.node.data as BaseNodeEdgeData).label;
    this.snackBar.open(`Palette item dropped: ${label}`, '', {
      duration: 4000,
    });
  }
}

import { Injectable, inject } from '@angular/core';
import {
  NgDiagramModelService, // Model queries (children, edges) and node/edge updates
  NgDiagramService, // transaction() - groups several updates into one undoable change
  Edge,
  EdgeEnd,
  GroupNode,
} from 'ng-diagram';
import { GroupNodeData, ReroutedEdgeEnd } from '../../types';

/** A collapsed group shrinks to its header bar; 48px keeps the ports (top: 24px) centered */
export const COLLAPSED_GROUP_SIZE = { width: 200, height: 48 };

/** Group ports (see group-node.component.html) that rerouted edge ends connect to */
const GROUP_PORT_BY_END: Record<EdgeEnd, string> = {
  source: 'port-right', // 'source' port
  target: 'port-left', // 'both' port
};

/** The source or target end of an edge, connected to the given node and port */
function endPatch(end: EdgeEnd, nodeId: string, portId?: string): Partial<Edge> {
  return end === 'source'
    ? { source: nodeId, sourcePort: portId }
    : { target: nodeId, targetPort: portId };
}

/**
 * GroupCollapseService
 *
 * Collapses a group to its header bar and expands it back (since 1.4).
 * Based on the "Expand/Collapse Groups" example from the ngDiagram docs.
 *
 * Key ng-diagram concepts:
 * 1. Hidden flag: collapsing sets `hidden: true` on the group's direct children only.
 *    The library hides the rest - descendants of a hidden child group and every edge
 *    connected to a hidden node - and skips hidden elements in hit-testing,
 *    selection, zoomToFit and the minimap.
 * 2. Boundary edges: an edge with exactly one end inside the group would disappear with
 *    that end's node, so the end is connected to the group's port while the group is
 *    collapsed, and restored on expand.
 * 3. Transactions: each toggle is a single model change (one undo step).
 */
@Injectable()
export class GroupCollapseService {
  private readonly modelService = inject(NgDiagramModelService);
  private readonly diagramService = inject(NgDiagramService);

  toggle(group: GroupNode<GroupNodeData>) {
    if (group.data.collapsed) {
      this.expand(group);
    } else {
      this.collapse(group);
    }
  }

  /** Number of nodes inside the group, nested groups included */
  countChildren(groupId: string): number {
    return this.modelService.getChildrenNested(groupId).length;
  }

  private collapse(group: GroupNode<GroupNodeData>) {
    const directChildren = this.modelService.getChildren(group.id);
    const nestedChildIds = new Set(
      this.modelService.getChildrenNested(group.id).map((child) => child.id),
    );
    const reroutedEdgeEnds = this.findBoundaryEdgeEnds(nestedChildIds, group.id);

    this.diagramService.transaction(() => {
      this.modelService.updateNodes(directChildren.map(({ id }) => ({ id, hidden: true })));

      this.modelService.updateEdges(
        reroutedEdgeEnds.map(({ edgeId, end }) => ({
          id: edgeId,
          ...endPatch(end, group.id, GROUP_PORT_BY_END[end]),
        })),
      );

      // An explicit size is applied only with autoSize off
      this.modelService.updateNode(group.id, {
        autoSize: false,
        size: COLLAPSED_GROUP_SIZE,
        data: {
          ...group.data,
          collapsed: true,
          expandedSize: group.size,
          expandedAutoSize: group.autoSize,
          reroutedEdgeEnds,
        },
      });
    });
  }

  private expand(group: GroupNode<GroupNodeData>) {
    const { expandedSize, expandedAutoSize, reroutedEdgeEnds = [], ...data } = group.data;
    const directChildren = this.modelService.getChildren(group.id);

    this.diagramService.transaction(() => {
      this.modelService.updateEdges(this.restoreEdgeEnds(reroutedEdgeEnds, group.id));

      // A nested group collapsed earlier keeps its own children hidden, so it stays collapsed
      this.modelService.updateNodes(directChildren.map(({ id }) => ({ id, hidden: false })));

      this.modelService.updateNode(group.id, {
        autoSize: expandedAutoSize,
        size: expandedSize,
        data: { ...data, collapsed: false },
      });
    });
  }

  /**
   * Ends of the edges that have exactly one end inside the group. Edges fully inside
   * are hidden with their nodes; an edge between a child and the group itself would end
   * up with both ends on the group, so it is skipped too.
   */
  private findBoundaryEdgeEnds(childIds: Set<string>, groupId: string): ReroutedEdgeEnd[] {
    const ends: ReroutedEdgeEnd[] = [];

    // Read from the model itself - the edges() signal can lag behind it
    for (const edge of this.modelService.getModel().getEdges()) {
      const sourceInside = childIds.has(edge.source);
      const targetInside = childIds.has(edge.target);
      if (sourceInside === targetInside) continue;
      if (edge.source === groupId || edge.target === groupId) continue;

      ends.push(
        sourceInside
          ? { edgeId: edge.id, end: 'source', nodeId: edge.source, portId: edge.sourcePort }
          : { edgeId: edge.id, end: 'target', nodeId: edge.target, portId: edge.targetPort },
      );
    }

    return ends;
  }

  /**
   * Updates that reconnect the recorded ends. An end is restored only while it is still
   * connected to this group - an outer group may have taken it over in the meantime
   * (it restores the end when it expands), or the user may have relinked it.
   */
  private restoreEdgeEnds(ends: ReroutedEdgeEnd[], groupId: string) {
    return ends
      .filter(({ edgeId, end }) => this.modelService.getEdgeById(edgeId)?.[end] === groupId)
      .map(({ edgeId, end, nodeId, portId }) => ({ id: edgeId, ...endPatch(end, nodeId, portId) }));
  }
}

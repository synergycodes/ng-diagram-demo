import { computed, Signal } from '@angular/core';
import { NgDiagramModelService } from 'ng-diagram';

/**
 * Returns a signal containing the set of port ids on the given node that are
 * currently used as the source or target of an edge. Used by node templates
 * to fade-out connected ports until the node is hovered.
 */
export function connectedPortIdsSignal(
  modelService: NgDiagramModelService,
  nodeId: Signal<string | undefined>,
): Signal<Set<string>> {
  return computed(() => {
    const id = nodeId();
    const ids = new Set<string>();
    if (!id) return ids;
    for (const edge of modelService.edges()) {
      if (edge.source === id && edge.sourcePort) ids.add(edge.sourcePort);
      if (edge.target === id && edge.targetPort) ids.add(edge.targetPort);
    }
    return ids;
  });
}

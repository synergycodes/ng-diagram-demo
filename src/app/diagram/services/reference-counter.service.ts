import { Injectable, inject } from '@angular/core';
import { NgDiagramModelService, Node } from 'ng-diagram';
import { AnyCircuitData } from '../../circuit/circuit-types';

/**
 * Stamps reference designators (R1, LED2, …) onto nodes whose data carries a
 * placeholder like "R?". Owns the per-prefix counters used by both palette
 * drops and template expansion so the numbering is consistent across both.
 */
@Injectable()
export class ReferenceCounterService {
  private readonly modelService = inject(NgDiagramModelService);
  private readonly counters = new Map<string, number>();

  /** Walk current model nodes and bump counters past their existing refs. */
  seedFrom(nodes: readonly Node<AnyCircuitData>[]): void {
    for (const n of nodes) {
      const ref = n.data?.reference;
      if (!ref) continue;
      const m = ref.match(/^([A-Za-z]+)(\d+)$/);
      if (!m) continue;
      const [, prefix, numStr] = m;
      const num = Number(numStr);
      const cur = this.counters.get(prefix) ?? 0;
      if (num > cur) this.counters.set(prefix, num);
    }
  }

  /**
   * If the node's reference is a placeholder (e.g. "R?"), assign the next free
   * number for that prefix and write it back to the model. Otherwise no-op.
   */
  assignReference(node: Node<AnyCircuitData>): void {
    const data = node.data as AnyCircuitData & { reference?: string };
    if (!data || !data.reference) return;

    const match = data.reference.match(/^([A-Za-z]+)\??$/);
    if (!match) return;

    const prefix = match[1];
    const next = (this.counters.get(prefix) ?? 0) + 1;
    this.counters.set(prefix, next);

    this.modelService.updateNodeData(node.id, { ...data, reference: `${prefix}${next}` });
  }

  /** Renumber a batch of just-added nodes (e.g. the result of a template expand). */
  renumber(nodeIds: readonly string[]): void {
    const all = this.modelService.nodes() as Node<AnyCircuitData>[];
    const byId = new Map(all.map((n) => [n.id, n]));
    for (const id of nodeIds) {
      const n = byId.get(id);
      if (n) this.assignReference(n);
    }
  }
}

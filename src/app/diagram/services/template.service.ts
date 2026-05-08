import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Edge,
  NgDiagramModelService,
  NgDiagramSelectionService,
  Node,
} from 'ng-diagram';
import { AnyCircuitData } from '../../circuit/circuit-types';

/**
 * Stripped, render-agnostic node descriptor stored inside a template.
 * Positions live as `offset` from the captured selection's bbox center.
 */
interface TemplateNode {
  localId: string;
  type?: string;
  data: AnyCircuitData;
  size?: { width: number; height: number };
  autoSize?: boolean;
  offset: { x: number; y: number };
}

interface TemplateEdge {
  data: object;
  sourceLocalId: string;
  sourcePort?: string;
  targetLocalId: string;
  targetPort?: string;
}

export interface CircuitTemplate {
  id: string;
  name: string;
  nodes: TemplateNode[];
  edges: TemplateEdge[];
}

/**
 * In-memory store of user-created templates plus the save/expand operations.
 * No persistence — templates die with the page.
 */
@Injectable()
export class TemplateService {
  private readonly modelService = inject(NgDiagramModelService);
  private readonly selectionService = inject(NgDiagramSelectionService);

  private readonly _templates = signal<CircuitTemplate[]>([]);
  readonly templates = this._templates.asReadonly();

  /**
   * Capture the current selection as a named template.
   * Edges with one endpoint outside the selection are dropped.
   * Reference designators (R1, LED3, …) are stripped to placeholders (R?, LED?).
   */
  saveFromSelection(
    name: string,
    selection: { nodes: readonly Node[]; edges: readonly Edge[] },
  ): CircuitTemplate {
    const nodes = selection.nodes as Node<AnyCircuitData>[];
    const selectedNodeIds = new Set(nodes.map((n) => n.id));

    // 1. Bbox over node positions + sizes (fall back to (0,0) if size missing).
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of nodes) {
      const w = n.size?.width ?? 0;
      const h = n.size?.height ?? 0;
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + w);
      maxY = Math.max(maxY, n.position.y + h);
    }
    const center = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };

    // 2. Captured nodes — assign template-local ids, strip references.
    //    Deep clone so later edits to live nodes don't mutate the template.
    const idMap = new Map<string, string>();
    const tNodes: TemplateNode[] = nodes.map((n, i) => {
      const localId = `n${i}`;
      idMap.set(n.id, localId);
      return {
        localId,
        type: n.type,
        data: stripReference(deepClone(n.data)),
        size: n.size ? { width: n.size.width, height: n.size.height } : undefined,
        autoSize: n.autoSize,
        offset: { x: n.position.x - center.x, y: n.position.y - center.y },
      };
    });

    // 3. Edges where both endpoints survived the selection filter.
    const tEdges: TemplateEdge[] = [];
    for (const e of selection.edges) {
      if (!selectedNodeIds.has(e.source) || !selectedNodeIds.has(e.target)) continue;
      tEdges.push({
        data: deepClone(e.data ?? {}),
        sourceLocalId: idMap.get(e.source)!,
        sourcePort: e.sourcePort,
        targetLocalId: idMap.get(e.target)!,
        targetPort: e.targetPort,
      });
    }

    const tpl: CircuitTemplate = {
      id: cryptoId(),
      name,
      nodes: tNodes,
      edges: tEdges,
    };
    this._templates.update((list) => [...list, tpl]);
    return tpl;
  }

  /**
   * Insert a template's contents centered on `dropPoint`. Returns the freshly
   * generated node ids so the caller can run reference renumbering on them.
   */
  expand(templateId: string, dropPoint: { x: number; y: number }): { nodeIds: string[] } {
    const tpl = this._templates().find((t) => t.id === templateId);
    if (!tpl) return { nodeIds: [] };

    const localToNewId = new Map<string, string>();
    const newNodes: Node<AnyCircuitData>[] = tpl.nodes.map((tn) => {
      const newId = cryptoId();
      localToNewId.set(tn.localId, newId);
      return {
        id: newId,
        type: tn.type,
        position: { x: dropPoint.x + tn.offset.x, y: dropPoint.y + tn.offset.y },
        data: deepClone(tn.data),
        size: tn.size ? { ...tn.size } : undefined,
        autoSize: tn.autoSize,
      } as Node<AnyCircuitData>;
    });

    const newEdges: Edge[] = tpl.edges.map((te) => ({
      id: cryptoId(),
      source: localToNewId.get(te.sourceLocalId)!,
      target: localToNewId.get(te.targetLocalId)!,
      sourcePort: te.sourcePort,
      targetPort: te.targetPort,
      data: deepClone(te.data),
    }));

    this.modelService.addNodes(newNodes as Node[]);
    if (newEdges.length) this.modelService.addEdges(newEdges);

    // Re-stamp the selection to exactly the new nodes (drops edge selection).
    const newNodeIds = newNodes.map((n) => n.id);
    this.selectionService.deselectAll();
    this.selectionService.select(newNodeIds);

    return { nodeIds: newNodeIds };
  }

  /** Convenience for the placeholder palette chip subtitle. */
  describe = computed(() =>
    this._templates().map((t) => ({
      id: t.id,
      name: t.name,
      subtitle: `${t.nodes.length} ${pluralize('node', t.nodes.length)} · ${t.edges.length} ${pluralize('wire', t.edges.length)}`,
    })),
  );
}

function stripReference(data: AnyCircuitData): AnyCircuitData {
  if (!data || typeof data !== 'object') return data;
  const ref = (data as { reference?: string }).reference;
  if (!ref) return { ...data };
  // Match prefix; tolerate trailing digits or an existing "?" placeholder.
  const m = ref.match(/^([A-Za-z]+)(?:\d+|\?)?$/);
  if (!m) return { ...data };
  return { ...data, reference: `${m[1]}?` };
}

function pluralize(word: string, n: number): string {
  return n === 1 ? word : `${word}s`;
}

function cryptoId(): string {
  // crypto.randomUUID is available in modern browsers; falls back to a simple random.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

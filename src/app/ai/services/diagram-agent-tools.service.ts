import { inject, Injectable } from '@angular/core';
import { Edge, NgDiagramModelService, NgDiagramViewportService, Node } from 'ng-diagram';
import {
  AnyCircuitData,
  BatteryData,
  CapacitorData,
  CircuitNodeType,
  DiodeData,
  IcData,
  LedData,
  PowerNetData,
  ResistorData,
} from '../../circuit/circuit-types';
import { findCatalogEntry, IC_CATALOG } from '../../circuit/ic-catalog';
import { computeIcNodeSize } from '../../circuit/palette-data';
import { ToolName } from './tools';

interface AddComponentInput {
  type: 'resistor' | 'capacitor' | 'diode' | 'led' | 'battery' | 'vcc' | 'gnd';
  position?: { x: number; y: number };
  value?: string;
  color?: string;
  netName?: string;
}

interface AddIcInput {
  model: string;
  position?: { x: number; y: number };
  customPinCount?: number;
  customVariant?: 'dip' | 'board';
  customPinNames?: string[];
}

interface ConnectInput {
  sourceReference: string;
  sourcePort: string;
  targetReference: string;
  targetPort: string;
}

interface DeleteInput {
  reference: string;
}

interface UpdateInput {
  reference: string;
  fields: Record<string, unknown>;
}

const DISCRETE_SIZE: Record<string, { width: number; height: number }> = {
  resistor: { width: 140, height: 60 },
  capacitor: { width: 140, height: 60 },
  diode: { width: 140, height: 60 },
  led: { width: 140, height: 72 },
  battery: { width: 140, height: 60 },
  vcc: { width: 60, height: 80 },
  gnd: { width: 60, height: 80 },
};

const REFERENCE_PREFIX: Record<string, string> = {
  resistor: 'R',
  capacitor: 'C',
  diode: 'D',
  led: 'LED',
  battery: 'BAT',
  vcc: 'PWR',
  gnd: 'GND',
};

/**
 * Executes the tool calls produced by the AI agent against the live diagram
 * model. Provided by DiagramComponent because it depends on the
 * ng-diagram services scoped to that component.
 */
@Injectable()
export class DiagramAgentToolsService {
  private readonly modelService = inject(NgDiagramModelService);
  private readonly viewportService = inject(NgDiagramViewportService);

  async run(name: ToolName, input: unknown): Promise<unknown> {
    switch (name) {
      case 'list_components':
        return this.listComponents();
      case 'list_connections':
        return this.listConnections();
      case 'add_component':
        return this.addComponent(input as AddComponentInput);
      case 'add_ic':
        return this.addIc(input as AddIcInput);
      case 'connect':
        return this.connect(input as ConnectInput);
      case 'delete_component':
        return this.deleteComponent(input as DeleteInput);
      case 'update_component':
        return this.updateComponent(input as UpdateInput);
    }
  }

  // ------------ inspection ------------

  private listComponents() {
    const nodes = this.modelService.nodes() as Node<AnyCircuitData>[];
    return {
      components: nodes.map((n) => {
        const data = n.data as AnyCircuitData;
        const summary: Record<string, unknown> = {
          reference: data?.reference ?? n.id,
          type: n.type,
          position: n.position,
        };
        if (n.type === CircuitNodeType.Ic || n.type === CircuitNodeType.Board) {
          const ic = data as IcData;
          summary['model'] = ic.model;
          summary['package'] = ic.packageType;
          summary['pins'] = ic.pins.map((p) => ({ number: p.number, name: p.name, side: p.side }));
        } else {
          // For discretes, surface the most useful data fields verbatim.
          for (const [k, v] of Object.entries(data ?? {})) {
            if (k === 'label') continue;
            summary[k] = v;
          }
        }
        return summary;
      }),
    };
  }

  private listConnections() {
    return {
      connections: this.modelService.edges().map((e) => ({
        id: e.id,
        source: this.refOf(e.source) ?? e.source,
        sourcePort: e.sourcePort ?? null,
        target: this.refOf(e.target) ?? e.target,
        targetPort: e.targetPort ?? null,
      })),
    };
  }

  // ------------ creation ------------

  private addComponent(input: AddComponentInput) {
    if (!REFERENCE_PREFIX[input.type]) {
      throw new Error(`Unknown component type: ${input.type}`);
    }
    const size = DISCRETE_SIZE[input.type];
    const position = input.position ?? this.suggestPosition(size);
    const reference = this.nextReference(REFERENCE_PREFIX[input.type]);

    const data = this.buildDiscreteData(input, reference);

    const node: Node<AnyCircuitData> = {
      id: this.makeNodeId(input.type),
      type: this.toCircuitType(input.type),
      position,
      autoSize: false,
      size,
      data,
    };
    this.modelService.addNodes([node]);

    return { reference, position };
  }

  private addIc(input: AddIcInput) {
    if (input.model === 'custom') {
      return this.addCustomIc(input);
    }
    const entry = findCatalogEntry(input.model) ?? this.findCatalogByLabel(input.model);
    if (!entry) {
      const known = IC_CATALOG.map((e) => e.data.model).join(', ');
      throw new Error(`Unknown IC model "${input.model}". Known models: ${known}, or use "custom".`);
    }
    const reference = this.nextReference(entry.referencePrefix);
    const data: IcData = {
      label: entry.paletteLabel,
      reference,
      ...entry.data,
    };
    const size = computeIcNodeSize(data);
    const position = input.position ?? this.suggestPosition(size);

    const node: Node<IcData> = {
      id: this.makeNodeId(entry.nodeType),
      type: entry.nodeType,
      position,
      autoSize: false,
      size,
      data,
    };
    this.modelService.addNodes([node]);
    return { reference, position };
  }

  private addCustomIc(input: AddIcInput) {
    const total = input.customPinCount ?? 8;
    if (total < 2 || total > 80) {
      throw new Error('customPinCount must be between 2 and 80.');
    }
    const variant = input.customVariant ?? 'dip';
    const leftCount = Math.ceil(total / 2);
    const rightCount = total - leftCount;
    const names = input.customPinNames ?? [];
    const pins: IcData['pins'] = [];
    for (let i = 0; i < leftCount; i++) {
      const number = i + 1;
      pins.push({ number, name: names[i] ?? `P${number}`, side: 'left' });
    }
    for (let i = 0; i < rightCount; i++) {
      const number = total - i;
      pins.push({ number, name: names[leftCount + i] ?? `P${number}`, side: 'right' });
    }
    const referencePrefix = variant === 'board' ? 'A' : 'U';
    const reference = this.nextReference(referencePrefix);
    const data: IcData = {
      label: 'Custom IC',
      reference,
      model: 'Custom IC',
      packageType: variant === 'board' ? 'Board' : `DIP-${total}`,
      pins,
      variant,
    };
    const size = computeIcNodeSize(data);
    const position = input.position ?? this.suggestPosition(size);
    const nodeType = variant === 'board' ? CircuitNodeType.Board : CircuitNodeType.Ic;
    const node: Node<IcData> = {
      id: this.makeNodeId(nodeType),
      type: nodeType,
      position,
      autoSize: false,
      size,
      data,
    };
    this.modelService.addNodes([node]);
    return { reference, position };
  }

  private connect(input: ConnectInput) {
    const source = this.findByReference(input.sourceReference);
    const target = this.findByReference(input.targetReference);
    if (!source) throw new Error(`No component with reference "${input.sourceReference}".`);
    if (!target) throw new Error(`No component with reference "${input.targetReference}".`);

    const edge: Edge = {
      id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source: source.id,
      sourcePort: input.sourcePort,
      target: target.id,
      targetPort: input.targetPort,
      sourceArrowhead: undefined,
      targetArrowhead: undefined,
      data: {},
    };
    this.modelService.addEdges([edge]);
    return { edgeId: edge.id };
  }

  private deleteComponent(input: DeleteInput) {
    const node = this.findByReference(input.reference);
    if (!node) throw new Error(`No component with reference "${input.reference}".`);
    this.modelService.deleteNodes([node.id]);
    return { deleted: true };
  }

  private updateComponent(input: UpdateInput) {
    const node = this.findByReference(input.reference);
    if (!node) throw new Error(`No component with reference "${input.reference}".`);
    this.modelService.updateNodeData(node.id, { ...node.data, ...input.fields });
    return { updated: true };
  }

  // ------------ helpers ------------

  private refOf(nodeId: string): string | undefined {
    const n = this.modelService.getNodeById<AnyCircuitData>(nodeId);
    return n ? (n.data as AnyCircuitData)?.reference : undefined;
  }

  private findByReference(reference: string): Node<AnyCircuitData> | undefined {
    const ref = reference.toLowerCase();
    return (this.modelService.nodes() as Node<AnyCircuitData>[]).find(
      (n) => (n.data as AnyCircuitData)?.reference?.toLowerCase() === ref,
    );
  }

  private nextReference(prefix: string): string {
    const re = new RegExp(`^${prefix}(\\d+)$`);
    let max = 0;
    for (const n of this.modelService.nodes() as Node<AnyCircuitData>[]) {
      const ref = (n.data as AnyCircuitData)?.reference;
      const m = ref?.match(re);
      if (m) max = Math.max(max, Number(m[1]));
    }
    return `${prefix}${max + 1}`;
  }

  private buildDiscreteData(input: AddComponentInput, reference: string): AnyCircuitData {
    switch (input.type) {
      case 'resistor':
        return {
          label: 'Resistor',
          reference,
          value: input.value ?? '10kΩ',
        } satisfies ResistorData;
      case 'capacitor':
        return {
          label: 'Capacitor',
          reference,
          value: input.value ?? '100µF',
        } satisfies CapacitorData;
      case 'diode':
        return {
          label: 'Diode',
          reference,
          model: input.value ?? '1N4148',
        } satisfies DiodeData;
      case 'led':
        return {
          label: 'LED',
          reference,
          color: input.color ?? 'Red',
          forwardVoltage: '2.0V',
        } satisfies LedData;
      case 'battery':
        return {
          label: 'Battery',
          reference,
          voltage: input.value ?? '9V',
        } satisfies BatteryData;
      case 'vcc':
        return {
          label: 'VCC',
          reference,
          netName: input.netName ?? '+5V',
          voltage: '5V',
        } satisfies PowerNetData;
      case 'gnd':
        return {
          label: 'GND',
          reference,
          netName: input.netName ?? 'GND',
        } satisfies PowerNetData;
    }
  }

  private toCircuitType(t: AddComponentInput['type']): CircuitNodeType {
    switch (t) {
      case 'resistor':
        return CircuitNodeType.Resistor;
      case 'capacitor':
        return CircuitNodeType.Capacitor;
      case 'diode':
        return CircuitNodeType.Diode;
      case 'led':
        return CircuitNodeType.Led;
      case 'battery':
        return CircuitNodeType.Battery;
      case 'vcc':
        return CircuitNodeType.Vcc;
      case 'gnd':
        return CircuitNodeType.Gnd;
    }
  }

  private findCatalogByLabel(model: string) {
    const m = model.toLowerCase();
    return IC_CATALOG.find(
      (e) =>
        e.data.model.toLowerCase() === m ||
        e.paletteLabel.toLowerCase() === m ||
        e.id === m,
    );
  }

  /** Place new components near the visible viewport center, slightly offset
   *  so successive adds don't stack on top of each other. */
  private suggestPosition(size: { width: number; height: number }): { x: number; y: number } {
    const rect = document.querySelector('ng-diagram')?.getBoundingClientRect();
    let center = { x: 200, y: 200 };
    if (rect) {
      const flowCenter = this.viewportService.clientToFlowPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      center = flowCenter;
    }
    const jitter = (this.modelService.nodes().length % 6) * 40;
    return {
      x: Math.round(center.x - size.width / 2 + jitter),
      y: Math.round(center.y - size.height / 2 + jitter),
    };
  }

  private makeNodeId(type: string): string {
    return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

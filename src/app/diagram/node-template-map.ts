import { NgDiagramNodeTemplateMap } from 'ng-diagram';
import { CircuitNodeType } from '../circuit/circuit-types';
import { ResistorNodeComponent } from './node-templates/resistor-node/resistor-node.component';
import { CapacitorNodeComponent } from './node-templates/capacitor-node/capacitor-node.component';
import { DiodeNodeComponent } from './node-templates/diode-node/diode-node.component';
import { LedNodeComponent } from './node-templates/led-node/led-node.component';
import { BatteryNodeComponent } from './node-templates/battery-node/battery-node.component';
import { GndNodeComponent } from './node-templates/gnd-node/gnd-node.component';
import { VccNodeComponent } from './node-templates/vcc-node/vcc-node.component';
import { IcNodeComponent } from './node-templates/ic-node/ic-node.component';

/**
 * Maps every circuit node type to the Angular component that renders it.
 * `Ic` and `Board` reuse the same component, switching layout via `data.variant`.
 */
export const nodeTemplateMap = new NgDiagramNodeTemplateMap([
  [CircuitNodeType.Resistor, ResistorNodeComponent],
  [CircuitNodeType.Capacitor, CapacitorNodeComponent],
  [CircuitNodeType.Diode, DiodeNodeComponent],
  [CircuitNodeType.Led, LedNodeComponent],
  [CircuitNodeType.Battery, BatteryNodeComponent],
  [CircuitNodeType.Gnd, GndNodeComponent],
  [CircuitNodeType.Vcc, VccNodeComponent],
  [CircuitNodeType.Ic, IcNodeComponent],
  [CircuitNodeType.Board, IcNodeComponent],
]);

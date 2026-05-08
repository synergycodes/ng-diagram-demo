/**
 * Domain types for the circuit / schematics builder.
 *
 * Each node placed on the diagram is identified by `CircuitNodeType` and carries a
 * data payload conforming to one of the data interfaces below. Templates are
 * registered against `CircuitNodeType` in node-template-map.ts.
 */

export enum CircuitNodeType {
  Resistor = 'resistor',
  Capacitor = 'capacitor',
  Diode = 'diode',
  Led = 'led',
  Battery = 'battery',
  Gnd = 'gnd',
  Vcc = 'vcc',
  Ic = 'ic',
  Board = 'board',
}

export type CircuitCategory =
  | 'passive'
  | 'semiconductors'
  | 'integrated-circuits'
  | 'power-and-ground';

/** Properties shared by every circuit node. */
export interface CircuitNodeBaseData {
  label: string;
  reference: string;
  description?: string;
  enableSnapDrag?: boolean;
  enableSnapResize?: boolean;
  enableSnapRotate?: boolean;
  snapDragStep?: number;
  snapResizeStep?: number;
  snapRotateStep?: number;
}

export interface ResistorData extends CircuitNodeBaseData {
  value: string;
  tolerance?: string;
  powerRating?: string;
  footprint?: string;
}

export interface CapacitorData extends CircuitNodeBaseData {
  value: string;
  voltageRating?: string;
  footprint?: string;
}

export interface DiodeData extends CircuitNodeBaseData {
  model: string;
  forwardVoltage?: string;
}

export interface LedData extends CircuitNodeBaseData {
  color: string;
  forwardVoltage?: string;
}

export interface BatteryData extends CircuitNodeBaseData {
  voltage: string;
}

export interface PowerNetData extends CircuitNodeBaseData {
  netName: string;
  voltage?: string;
}

export interface IcPin {
  number: number;
  name: string;
  side: 'left' | 'right';
  /** Optional pin function flag. */
  type?: 'input' | 'output' | 'power' | 'ground' | 'io' | 'analog' | 'pwm';
}

export interface IcData extends CircuitNodeBaseData {
  model: string;
  packageType: string;
  supplyVoltage?: string;
  pins: IcPin[];
  /** When true, render with the 'board' look (rounded outline, model centered). */
  variant?: 'dip' | 'board';
}

export type AnyCircuitData =
  | ResistorData
  | CapacitorData
  | DiodeData
  | LedData
  | BatteryData
  | PowerNetData
  | IcData;

export interface CircuitNodeMinSize {
  width: number;
  height: number;
}

/** Visual layout constants shared by templates that draw schematic symbols. */
export const PORT_SIZE = 12;

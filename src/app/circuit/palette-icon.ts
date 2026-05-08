import { CircuitNodeType } from './circuit-types';

/** Identifier for the small SVG glyph used in palette cards. */
export type PaletteIconType =
  | 'resistor'
  | 'capacitor'
  | 'diode'
  | 'led'
  | 'battery'
  | 'gnd'
  | 'vcc'
  | 'ic'
  | 'board';

export function defaultIconForType(type: CircuitNodeType): PaletteIconType {
  switch (type) {
    case CircuitNodeType.Resistor:
      return 'resistor';
    case CircuitNodeType.Capacitor:
      return 'capacitor';
    case CircuitNodeType.Diode:
      return 'diode';
    case CircuitNodeType.Led:
      return 'led';
    case CircuitNodeType.Battery:
      return 'battery';
    case CircuitNodeType.Gnd:
      return 'gnd';
    case CircuitNodeType.Vcc:
      return 'vcc';
    case CircuitNodeType.Ic:
      return 'ic';
    case CircuitNodeType.Board:
      return 'board';
  }
}

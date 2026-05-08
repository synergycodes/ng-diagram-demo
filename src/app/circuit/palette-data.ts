import { NgDiagramPaletteItem } from 'ng-diagram';
import {
  AnyCircuitData,
  BatteryData,
  CapacitorData,
  CircuitCategory,
  CircuitNodeType,
  DiodeData,
  IcData,
  LedData,
  PaletteTab,
  PowerNetData,
  ResistorData,
} from './circuit-types';
import { IC_CATALOG } from './ic-catalog';
import { PaletteIconType, defaultIconForType } from './palette-icon';

export interface CircuitPaletteEntry {
  /** Top-level tab the entry belongs to. */
  tab: PaletteTab;
  category: CircuitCategory;
  label: string;
  subtitle: string;
  iconType: PaletteIconType;
  /** Stable key used for tracking in the UI. */
  key: string;
  /** Item handed to <ng-diagram-palette-item>. */
  ngItem: NgDiagramPaletteItem<AnyCircuitData>;
}

export const CATEGORIES: { id: CircuitCategory; title: string }[] = [
  { id: 'passive', title: 'Passive' },
  { id: 'semiconductors', title: 'Semiconductors' },
  { id: 'development-boards', title: 'Development boards' },
  { id: 'integrated-circuits', title: 'Integrated Circuits' },
  { id: 'power-and-ground', title: 'Power & Ground' },
];

export const TABS: { id: PaletteTab; title: string }[] = [
  { id: 'basic', title: 'Basic' },
  { id: 'brands', title: 'Brands' },
  { id: 'my', title: 'My' },
];

const FIXED_SIZE = {
  resistor: { width: 140, height: 60 },
  capacitor: { width: 140, height: 60 },
  diode: { width: 140, height: 60 },
  led: { width: 140, height: 72 },
  battery: { width: 140, height: 60 },
  gnd: { width: 60, height: 80 },
  vcc: { width: 60, height: 80 },
} as const;

/**
 * Compute node size for an IC/Board so that ng-diagram has dimensions on drop
 * without waiting for autoSize measurement. Mirrors IcNodeComponent geometry.
 */
export function computeIcNodeSize(data: IcData): { width: number; height: number } {
  const isBoard = data.variant === 'board';
  const left = data.pins.filter((p) => p.side === 'left').length;
  const right = data.pins.filter((p) => p.side === 'right').length;
  const max = Math.max(left, right, 1);
  if (isBoard) {
    const bodyHeight = 16 + 16 + (max - 1) * 24;
    return { width: 232, height: 17 + bodyHeight };
  }
  const bodyHeight = 15 + 20 + (max - 1) * 15;
  return { width: 120, height: 20 + bodyHeight + 20 };
}

const resistor: CircuitPaletteEntry = {
  tab: 'basic',
  category: 'passive',
  label: 'Resistor',
  subtitle: 'R · 2 pins',
  iconType: 'resistor',
  key: 'resistor',
  ngItem: {
    type: CircuitNodeType.Resistor,
    autoSize: false,
    size: FIXED_SIZE.resistor,
    data: {
      label: 'Resistor',
      reference: 'R?',
      value: '10kΩ',
      tolerance: '5%',
      powerRating: '0.25W',
      footprint: '0805 (SMD)',
    } satisfies ResistorData,
  },
};

const capacitor: CircuitPaletteEntry = {
  tab: 'basic',
  category: 'passive',
  label: 'Capacitor',
  subtitle: 'C · 2 pins',
  iconType: 'capacitor',
  key: 'capacitor',
  ngItem: {
    type: CircuitNodeType.Capacitor,
    autoSize: false,
    size: FIXED_SIZE.capacitor,
    data: {
      label: 'Capacitor',
      reference: 'C?',
      value: '100µF',
      voltageRating: '25V',
      footprint: '0805 (SMD)',
    } satisfies CapacitorData,
  },
};

const diode: CircuitPaletteEntry = {
  tab: 'basic',
  category: 'semiconductors',
  label: 'Diode',
  subtitle: 'D · 2 pins',
  iconType: 'diode',
  key: 'diode',
  ngItem: {
    type: CircuitNodeType.Diode,
    autoSize: false,
    size: FIXED_SIZE.diode,
    data: {
      label: 'Diode',
      reference: 'D?',
      model: '1N4148',
      forwardVoltage: '0.7V',
    } satisfies DiodeData,
  },
};

const led: CircuitPaletteEntry = {
  tab: 'basic',
  category: 'semiconductors',
  label: 'LED',
  subtitle: 'D · 2 pins',
  iconType: 'led',
  key: 'led',
  ngItem: {
    type: CircuitNodeType.Led,
    autoSize: false,
    size: FIXED_SIZE.led,
    data: {
      label: 'LED',
      reference: 'LED?',
      color: 'Red',
      forwardVoltage: '2.0V',
    } satisfies LedData,
  },
};

const battery: CircuitPaletteEntry = {
  tab: 'basic',
  category: 'power-and-ground',
  label: 'Battery',
  subtitle: 'BAT · 2 pins',
  iconType: 'battery',
  key: 'battery',
  ngItem: {
    type: CircuitNodeType.Battery,
    autoSize: false,
    size: FIXED_SIZE.battery,
    data: {
      label: 'Battery',
      reference: 'BAT?',
      voltage: '9V',
    } satisfies BatteryData,
  },
};

const vcc: CircuitPaletteEntry = {
  tab: 'basic',
  category: 'power-and-ground',
  label: 'VCC',
  subtitle: '1 pin · source',
  iconType: 'vcc',
  key: 'vcc',
  ngItem: {
    type: CircuitNodeType.Vcc,
    autoSize: false,
    size: FIXED_SIZE.vcc,
    data: {
      label: 'VCC',
      reference: 'PWR?',
      netName: '+5V',
      voltage: '5V',
    } satisfies PowerNetData,
  },
};

const gnd: CircuitPaletteEntry = {
  tab: 'basic',
  category: 'power-and-ground',
  label: 'GND',
  subtitle: '1 pin · target',
  iconType: 'gnd',
  key: 'gnd',
  ngItem: {
    type: CircuitNodeType.Gnd,
    autoSize: false,
    size: FIXED_SIZE.gnd,
    data: {
      label: 'GND',
      reference: 'GND?',
      netName: 'GND',
    } satisfies PowerNetData,
  },
};

const icEntries: CircuitPaletteEntry[] = IC_CATALOG.map((entry) => {
  const data: IcData = {
    label: entry.paletteLabel,
    reference: `${entry.referencePrefix}?`,
    ...entry.data,
  };
  // Boards (Arduino, ESP32, NodeMCU, Pico) live under Basic > Development
  // boards. Chip-style ICs (NE555, LM358, …) live under Brands so the Basic
  // tab stays focused on schematic primitives.
  const isBoard = data.variant === 'board';
  return {
    tab: isBoard ? 'basic' : 'brands',
    category: isBoard ? 'development-boards' : 'integrated-circuits',
    label: entry.paletteLabel,
    subtitle: entry.paletteSubtitle,
    iconType: defaultIconForType(entry.nodeType),
    key: entry.id,
    ngItem: {
      type: entry.nodeType,
      autoSize: false,
      size: computeIcNodeSize(data),
      data,
    },
  };
});

export const PALETTE_ENTRIES: CircuitPaletteEntry[] = [
  resistor,
  capacitor,
  diode,
  led,
  ...icEntries,
  battery,
  vcc,
  gnd,
];

export interface PaletteSection {
  category: CircuitCategory;
  title: string;
  items: CircuitPaletteEntry[];
}

export function groupBySection(entries: CircuitPaletteEntry[]): PaletteSection[] {
  return CATEGORIES.map(({ id, title }) => ({
    category: id,
    title,
    items: entries.filter((e) => e.category === id),
  })).filter((s) => s.items.length > 0);
}

export function entriesForTab(tab: PaletteTab): CircuitPaletteEntry[] {
  return PALETTE_ENTRIES.filter((e) => e.tab === tab);
}

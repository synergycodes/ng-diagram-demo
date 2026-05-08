import { CircuitNodeType, IcData, IcPin } from './circuit-types';

/**
 * Bundled catalog of popular ICs and dev boards. Pin numbering follows the
 * datasheet convention: pin 1 is the top-left, then descend the left column,
 * then come up the right column.
 *
 * Sources: TI / NXP / Atmel / Espressif / Arduino / Raspberry Pi datasheets.
 */

export interface CatalogEntry {
  /** Stable identifier used as the palette item key. */
  id: string;
  /** Display name in the palette. */
  paletteLabel: string;
  /** Short subtitle in the palette card. */
  paletteSubtitle: string;
  /** Reference designator prefix (U for ICs, A for boards, etc.). */
  referencePrefix: string;
  /** The node template to instantiate. */
  nodeType: CircuitNodeType.Ic | CircuitNodeType.Board;
  data: Omit<IcData, 'reference' | 'label'>;
}

const ne555Pins: IcPin[] = [
  { number: 1, name: 'GND', side: 'left', type: 'ground' },
  { number: 2, name: 'TRIG', side: 'left', type: 'input' },
  { number: 3, name: 'OUT', side: 'left', type: 'output' },
  { number: 4, name: 'RST', side: 'left', type: 'input' },
  { number: 5, name: 'CTRL', side: 'right', type: 'input' },
  { number: 6, name: 'THR', side: 'right', type: 'input' },
  { number: 7, name: 'DIS', side: 'right', type: 'output' },
  { number: 8, name: 'VCC', side: 'right', type: 'power' },
];

const lm358Pins: IcPin[] = [
  { number: 1, name: '1OUT', side: 'left', type: 'output' },
  { number: 2, name: '1IN-', side: 'left', type: 'input' },
  { number: 3, name: '1IN+', side: 'left', type: 'input' },
  { number: 4, name: 'GND', side: 'left', type: 'ground' },
  { number: 5, name: '2IN+', side: 'right', type: 'input' },
  { number: 6, name: '2IN-', side: 'right', type: 'input' },
  { number: 7, name: '2OUT', side: 'right', type: 'output' },
  { number: 8, name: 'VCC', side: 'right', type: 'power' },
];

const lm741Pins: IcPin[] = [
  { number: 1, name: 'OFFSET', side: 'left' },
  { number: 2, name: 'IN-', side: 'left', type: 'input' },
  { number: 3, name: 'IN+', side: 'left', type: 'input' },
  { number: 4, name: 'V-', side: 'left', type: 'power' },
  { number: 5, name: 'OFFSET', side: 'right' },
  { number: 6, name: 'OUT', side: 'right', type: 'output' },
  { number: 7, name: 'V+', side: 'right', type: 'power' },
  { number: 8, name: 'NC', side: 'right' },
];

const lm7805Pins: IcPin[] = [
  { number: 1, name: 'IN', side: 'left', type: 'power' },
  { number: 2, name: 'GND', side: 'left', type: 'ground' },
  { number: 3, name: 'OUT', side: 'right', type: 'power' },
];

const sn74hc595Pins: IcPin[] = [
  { number: 1, name: 'QB', side: 'left', type: 'output' },
  { number: 2, name: 'QC', side: 'left', type: 'output' },
  { number: 3, name: 'QD', side: 'left', type: 'output' },
  { number: 4, name: 'QE', side: 'left', type: 'output' },
  { number: 5, name: 'QF', side: 'left', type: 'output' },
  { number: 6, name: 'QG', side: 'left', type: 'output' },
  { number: 7, name: 'QH', side: 'left', type: 'output' },
  { number: 8, name: 'GND', side: 'left', type: 'ground' },
  { number: 9, name: 'QH*', side: 'right', type: 'output' },
  { number: 10, name: 'SRCLR', side: 'right', type: 'input' },
  { number: 11, name: 'SRCLK', side: 'right', type: 'input' },
  { number: 12, name: 'RCLK', side: 'right', type: 'input' },
  { number: 13, name: 'OE', side: 'right', type: 'input' },
  { number: 14, name: 'SER', side: 'right', type: 'input' },
  { number: 15, name: 'QA', side: 'right', type: 'output' },
  { number: 16, name: 'VCC', side: 'right', type: 'power' },
];

const atmega328pPins: IcPin[] = [
  { number: 1, name: 'PC6/RST', side: 'left', type: 'io' },
  { number: 2, name: 'PD0/RX', side: 'left', type: 'io' },
  { number: 3, name: 'PD1/TX', side: 'left', type: 'io' },
  { number: 4, name: 'PD2', side: 'left', type: 'io' },
  { number: 5, name: 'PD3', side: 'left', type: 'pwm' },
  { number: 6, name: 'PD4', side: 'left', type: 'io' },
  { number: 7, name: 'VCC', side: 'left', type: 'power' },
  { number: 8, name: 'GND', side: 'left', type: 'ground' },
  { number: 9, name: 'PB6/XT1', side: 'left', type: 'io' },
  { number: 10, name: 'PB7/XT2', side: 'left', type: 'io' },
  { number: 11, name: 'PD5', side: 'left', type: 'pwm' },
  { number: 12, name: 'PD6', side: 'left', type: 'pwm' },
  { number: 13, name: 'PD7', side: 'left', type: 'io' },
  { number: 14, name: 'PB0', side: 'left', type: 'io' },
  { number: 15, name: 'PB1', side: 'right', type: 'pwm' },
  { number: 16, name: 'PB2/SS', side: 'right', type: 'pwm' },
  { number: 17, name: 'PB3/MOSI', side: 'right', type: 'pwm' },
  { number: 18, name: 'PB4/MISO', side: 'right', type: 'io' },
  { number: 19, name: 'PB5/SCK', side: 'right', type: 'io' },
  { number: 20, name: 'AVCC', side: 'right', type: 'power' },
  { number: 21, name: 'AREF', side: 'right', type: 'analog' },
  { number: 22, name: 'GND', side: 'right', type: 'ground' },
  { number: 23, name: 'PC0/A0', side: 'right', type: 'analog' },
  { number: 24, name: 'PC1/A1', side: 'right', type: 'analog' },
  { number: 25, name: 'PC2/A2', side: 'right', type: 'analog' },
  { number: 26, name: 'PC3/A3', side: 'right', type: 'analog' },
  { number: 27, name: 'PC4/A4', side: 'right', type: 'analog' },
  { number: 28, name: 'PC5/A5', side: 'right', type: 'analog' },
];

const arduinoUnoPins: IcPin[] = [
  { number: 1, name: 'D0/RX', side: 'left', type: 'io' },
  { number: 2, name: 'D1/TX', side: 'left', type: 'io' },
  { number: 3, name: 'D2', side: 'left', type: 'io' },
  { number: 4, name: 'D3', side: 'left', type: 'pwm' },
  { number: 5, name: 'D4', side: 'left', type: 'io' },
  { number: 6, name: 'D5', side: 'left', type: 'pwm' },
  { number: 7, name: 'D6', side: 'left', type: 'pwm' },
  { number: 8, name: 'D7', side: 'left', type: 'io' },
  { number: 9, name: 'D8', side: 'left', type: 'io' },
  { number: 10, name: 'D9', side: 'left', type: 'pwm' },
  { number: 11, name: 'D10', side: 'left', type: 'pwm' },
  { number: 12, name: 'D11', side: 'left', type: 'pwm' },
  { number: 13, name: 'D12', side: 'left', type: 'io' },
  { number: 14, name: 'D13', side: 'left', type: 'io' },
  { number: 15, name: 'VIN', side: 'right', type: 'power' },
  { number: 16, name: 'GND', side: 'right', type: 'ground' },
  { number: 17, name: '5V', side: 'right', type: 'power' },
  { number: 18, name: '3.3V', side: 'right', type: 'power' },
  { number: 19, name: 'RST', side: 'right', type: 'io' },
  { number: 20, name: 'A0', side: 'right', type: 'analog' },
  { number: 21, name: 'A1', side: 'right', type: 'analog' },
  { number: 22, name: 'A2', side: 'right', type: 'analog' },
  { number: 23, name: 'A3', side: 'right', type: 'analog' },
  { number: 24, name: 'A4', side: 'right', type: 'analog' },
  { number: 25, name: 'A5', side: 'right', type: 'analog' },
];

const esp32Pins: IcPin[] = [
  { number: 1, name: '3.3V', side: 'left', type: 'power' },
  { number: 2, name: 'EN', side: 'left', type: 'io' },
  { number: 3, name: 'GPIO36', side: 'left', type: 'analog' },
  { number: 4, name: 'GPIO39', side: 'left', type: 'analog' },
  { number: 5, name: 'GPIO34', side: 'left', type: 'analog' },
  { number: 6, name: 'GPIO35', side: 'left', type: 'analog' },
  { number: 7, name: 'GPIO32', side: 'left', type: 'io' },
  { number: 8, name: 'GPIO33', side: 'left', type: 'io' },
  { number: 9, name: 'GPIO25', side: 'left', type: 'io' },
  { number: 10, name: 'GPIO26', side: 'left', type: 'io' },
  { number: 11, name: 'GPIO27', side: 'left', type: 'io' },
  { number: 12, name: 'GPIO14', side: 'left', type: 'io' },
  { number: 13, name: 'GPIO12', side: 'left', type: 'io' },
  { number: 14, name: 'GND', side: 'left', type: 'ground' },
  { number: 15, name: 'GPIO13', side: 'left', type: 'io' },
  { number: 16, name: 'VIN', side: 'right', type: 'power' },
  { number: 17, name: 'GND', side: 'right', type: 'ground' },
  { number: 18, name: 'GPIO23', side: 'right', type: 'io' },
  { number: 19, name: 'GPIO22', side: 'right', type: 'io' },
  { number: 20, name: 'GPIO1/TX', side: 'right', type: 'io' },
  { number: 21, name: 'GPIO3/RX', side: 'right', type: 'io' },
  { number: 22, name: 'GPIO21', side: 'right', type: 'io' },
  { number: 23, name: 'GPIO19', side: 'right', type: 'io' },
  { number: 24, name: 'GPIO18', side: 'right', type: 'io' },
  { number: 25, name: 'GPIO5', side: 'right', type: 'io' },
  { number: 26, name: 'GPIO17', side: 'right', type: 'io' },
  { number: 27, name: 'GPIO16', side: 'right', type: 'io' },
  { number: 28, name: 'GPIO4', side: 'right', type: 'io' },
  { number: 29, name: 'GPIO0', side: 'right', type: 'io' },
  { number: 30, name: 'GPIO2', side: 'right', type: 'io' },
  { number: 31, name: 'GPIO15', side: 'right', type: 'io' },
];

const esp8266Pins: IcPin[] = [
  { number: 1, name: 'A0', side: 'left', type: 'analog' },
  { number: 2, name: 'D0/GPIO16', side: 'left', type: 'io' },
  { number: 3, name: 'D1/GPIO5', side: 'left', type: 'io' },
  { number: 4, name: 'D2/GPIO4', side: 'left', type: 'io' },
  { number: 5, name: 'D3/GPIO0', side: 'left', type: 'io' },
  { number: 6, name: 'D4/GPIO2', side: 'left', type: 'io' },
  { number: 7, name: '3.3V', side: 'left', type: 'power' },
  { number: 8, name: 'GND', side: 'left', type: 'ground' },
  { number: 9, name: 'D5/GPIO14', side: 'right', type: 'io' },
  { number: 10, name: 'D6/GPIO12', side: 'right', type: 'io' },
  { number: 11, name: 'D7/GPIO13', side: 'right', type: 'io' },
  { number: 12, name: 'D8/GPIO15', side: 'right', type: 'io' },
  { number: 13, name: 'RX', side: 'right', type: 'io' },
  { number: 14, name: 'TX', side: 'right', type: 'io' },
  { number: 15, name: 'GND', side: 'right', type: 'ground' },
  { number: 16, name: 'VIN', side: 'right', type: 'power' },
];

const rpiPicoPins: IcPin[] = [
  { number: 1, name: 'GP0', side: 'left', type: 'io' },
  { number: 2, name: 'GP1', side: 'left', type: 'io' },
  { number: 3, name: 'GND', side: 'left', type: 'ground' },
  { number: 4, name: 'GP2', side: 'left', type: 'io' },
  { number: 5, name: 'GP3', side: 'left', type: 'io' },
  { number: 6, name: 'GP4', side: 'left', type: 'io' },
  { number: 7, name: 'GP5', side: 'left', type: 'io' },
  { number: 8, name: 'GND', side: 'left', type: 'ground' },
  { number: 9, name: 'GP6', side: 'left', type: 'io' },
  { number: 10, name: 'GP7', side: 'left', type: 'io' },
  { number: 11, name: 'GP8', side: 'left', type: 'io' },
  { number: 12, name: 'GP9', side: 'left', type: 'io' },
  { number: 13, name: 'GND', side: 'left', type: 'ground' },
  { number: 14, name: 'GP10', side: 'left', type: 'io' },
  { number: 15, name: 'GP11', side: 'left', type: 'io' },
  { number: 16, name: 'GP12', side: 'left', type: 'io' },
  { number: 17, name: 'GP13', side: 'left', type: 'io' },
  { number: 18, name: 'GND', side: 'left', type: 'ground' },
  { number: 19, name: 'GP14', side: 'left', type: 'io' },
  { number: 20, name: 'GP15', side: 'left', type: 'io' },
  { number: 21, name: 'GP16', side: 'right', type: 'io' },
  { number: 22, name: 'GP17', side: 'right', type: 'io' },
  { number: 23, name: 'GND', side: 'right', type: 'ground' },
  { number: 24, name: 'GP18', side: 'right', type: 'io' },
  { number: 25, name: 'GP19', side: 'right', type: 'io' },
  { number: 26, name: 'GP20', side: 'right', type: 'io' },
  { number: 27, name: 'GP21', side: 'right', type: 'io' },
  { number: 28, name: 'GND', side: 'right', type: 'ground' },
  { number: 29, name: 'GP22', side: 'right', type: 'io' },
  { number: 30, name: 'RUN', side: 'right', type: 'io' },
  { number: 31, name: 'GP26/A0', side: 'right', type: 'analog' },
  { number: 32, name: 'GP27/A1', side: 'right', type: 'analog' },
  { number: 33, name: 'GND', side: 'right', type: 'ground' },
  { number: 34, name: 'GP28/A2', side: 'right', type: 'analog' },
  { number: 35, name: 'AREF', side: 'right', type: 'analog' },
  { number: 36, name: '3V3', side: 'right', type: 'power' },
  { number: 37, name: '3V3 EN', side: 'right', type: 'io' },
  { number: 38, name: 'GND', side: 'right', type: 'ground' },
  { number: 39, name: 'VSYS', side: 'right', type: 'power' },
  { number: 40, name: 'VBUS', side: 'right', type: 'power' },
];

export const IC_CATALOG: CatalogEntry[] = [
  {
    id: 'ne555',
    paletteLabel: 'NE555',
    paletteSubtitle: 'Timer · DIP-8',
    referencePrefix: 'U',
    nodeType: CircuitNodeType.Ic,
    data: {
      model: 'NE555',
      packageType: 'DIP-8',
      supplyVoltage: '4.5V – 16V',
      pins: ne555Pins,
      variant: 'dip',
      description: 'Precision timer / oscillator IC.',
    },
  },
  {
    id: 'lm358',
    paletteLabel: 'LM358',
    paletteSubtitle: 'Dual op-amp · DIP-8',
    referencePrefix: 'U',
    nodeType: CircuitNodeType.Ic,
    data: {
      model: 'LM358',
      packageType: 'DIP-8',
      supplyVoltage: '3V – 32V',
      pins: lm358Pins,
      variant: 'dip',
      description: 'Dual low-power operational amplifier.',
    },
  },
  {
    id: 'lm741',
    paletteLabel: 'LM741',
    paletteSubtitle: 'Op-amp · DIP-8',
    referencePrefix: 'U',
    nodeType: CircuitNodeType.Ic,
    data: {
      model: 'LM741',
      packageType: 'DIP-8',
      supplyVoltage: '±5V – ±15V',
      pins: lm741Pins,
      variant: 'dip',
      description: 'Single operational amplifier.',
    },
  },
  {
    id: 'lm7805',
    paletteLabel: '7805',
    paletteSubtitle: 'Voltage reg · TO-220',
    referencePrefix: 'U',
    nodeType: CircuitNodeType.Ic,
    data: {
      model: 'LM7805',
      packageType: 'TO-220',
      supplyVoltage: '7V – 35V in / 5V out',
      pins: lm7805Pins,
      variant: 'dip',
      description: 'Linear +5V voltage regulator.',
    },
  },
  {
    id: 'sn74hc595',
    paletteLabel: '74HC595',
    paletteSubtitle: 'Shift register · DIP-16',
    referencePrefix: 'U',
    nodeType: CircuitNodeType.Ic,
    data: {
      model: '74HC595',
      packageType: 'DIP-16',
      supplyVoltage: '2V – 6V',
      pins: sn74hc595Pins,
      variant: 'dip',
      description: '8-bit serial-in / parallel-out shift register.',
    },
  },
  {
    id: 'atmega328p',
    paletteLabel: 'ATmega328P',
    paletteSubtitle: 'MCU · DIP-28',
    referencePrefix: 'U',
    nodeType: CircuitNodeType.Ic,
    data: {
      model: 'ATmega328P',
      packageType: 'DIP-28',
      supplyVoltage: '1.8V – 5.5V',
      pins: atmega328pPins,
      variant: 'dip',
      description: '8-bit AVR microcontroller.',
    },
  },
  {
    id: 'arduino-uno',
    paletteLabel: 'Arduino UNO',
    paletteSubtitle: 'Dev board · 25 pins',
    referencePrefix: 'A',
    nodeType: CircuitNodeType.Board,
    data: {
      model: 'Arduino UNO',
      packageType: 'Board',
      supplyVoltage: '5V (USB / VIN)',
      pins: arduinoUnoPins,
      variant: 'board',
      description: 'ATmega328P-based development board.',
    },
  },
  {
    id: 'esp32-devkit',
    paletteLabel: 'ESP32 DevKit',
    paletteSubtitle: 'Wi-Fi/BT · 30 pins',
    referencePrefix: 'A',
    nodeType: CircuitNodeType.Board,
    data: {
      model: 'ESP32 DevKit V1',
      packageType: 'Board',
      supplyVoltage: '3.3V (USB / VIN 5V)',
      pins: esp32Pins,
      variant: 'board',
      description: 'Espressif ESP32 dual-core dev board.',
    },
  },
  {
    id: 'nodemcu',
    paletteLabel: 'NodeMCU',
    paletteSubtitle: 'ESP8266 · 16 pins',
    referencePrefix: 'A',
    nodeType: CircuitNodeType.Board,
    data: {
      model: 'NodeMCU (ESP8266)',
      packageType: 'Board',
      supplyVoltage: '3.3V (USB / VIN 5V)',
      pins: esp8266Pins,
      variant: 'board',
      description: 'ESP-12E based Wi-Fi dev board.',
    },
  },
  {
    id: 'rpi-pico',
    paletteLabel: 'Raspberry Pi Pico',
    paletteSubtitle: 'RP2040 · 40 pins',
    referencePrefix: 'A',
    nodeType: CircuitNodeType.Board,
    data: {
      model: 'Raspberry Pi Pico',
      packageType: 'Board',
      supplyVoltage: '1.8V – 5.5V (VSYS)',
      pins: rpiPicoPins,
      variant: 'board',
      description: 'RP2040 dual-core ARM dev board.',
    },
  },
];

export function findCatalogEntry(model: string): CatalogEntry | undefined {
  return IC_CATALOG.find((entry) => entry.data.model === model);
}

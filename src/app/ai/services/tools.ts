import { jsonSchema, tool, ToolSet } from 'ai';
import { DiagramAgentToolsService } from './diagram-agent-tools.service';

export type ToolName =
  | 'list_components'
  | 'list_connections'
  | 'add_component'
  | 'add_ic'
  | 'connect'
  | 'delete_component'
  | 'update_component';

/**
 * Build the AI SDK tool registry. Each tool's `execute` delegates to
 * `DiagramAgentToolsService` which performs the actual ng-diagram mutation.
 *
 * Schemas are written as JSON Schema (rather than Zod) to keep them close to
 * the description text and avoid pulling Zod into the dependency surface for
 * field types we already validate at the diagram boundary.
 */
export function buildAgentTools(runner: DiagramAgentToolsService): ToolSet {
  const exec =
    (name: ToolName) =>
    async (args: unknown) =>
      runner.run(name, args);

  return {
    list_components: tool({
      description:
        'List every component currently on the diagram with its reference, type, position, and key data fields. Call this before answering questions about the existing schematic.',
      inputSchema: jsonSchema({ type: 'object', properties: {} }),
      execute: exec('list_components'),
    }),
    list_connections: tool({
      description:
        'List every wire (edge) currently on the diagram, including which port on which component it connects.',
      inputSchema: jsonSchema({ type: 'object', properties: {} }),
      execute: exec('list_connections'),
    }),
    add_component: tool({
      description:
        'Add a discrete circuit component (resistor, capacitor, diode, led, battery, vcc, gnd). Returns { reference, position } — use the reference for subsequent connect / update / delete calls.',
      inputSchema: jsonSchema({
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['resistor', 'capacitor', 'diode', 'led', 'battery', 'vcc', 'gnd'],
          },
          position: {
            type: 'object',
            properties: { x: { type: 'number' }, y: { type: 'number' } },
            description:
              'Optional canvas position. If omitted the component is placed near the visible viewport center.',
          },
          value: {
            type: 'string',
            description:
              'Resistor: "10kΩ", "220Ω". Capacitor: "100µF", "10nF". Battery: voltage like "9V". Diode: model like "1N4148". Ignored for vcc/gnd/led.',
          },
          color: {
            type: 'string',
            description: 'LED only: "Red", "Green", "Blue", etc.',
          },
          netName: {
            type: 'string',
            description: 'VCC/GND only: net label like "+5V", "+3.3V", "GND". Defaults: "+5V" / "GND".',
          },
        },
        required: ['type'],
      }),
      execute: exec('add_component'),
    }),
    add_ic: tool({
      description:
        'Add an IC or development board. Pass a catalog model name (NE555, LM358, LM741, 7805, 74HC595, ATmega328P, Arduino UNO, ESP32 DevKit V1, NodeMCU, Raspberry Pi Pico) or "custom" with the customPinCount/customVariant/customPinNames params. Returns { reference, position }.',
      inputSchema: jsonSchema({
        type: 'object',
        properties: {
          model: { type: 'string' },
          position: {
            type: 'object',
            properties: { x: { type: 'number' }, y: { type: 'number' } },
          },
          customPinCount: {
            type: 'integer',
            description: 'Only when model="custom": total pin count (2 to 80).',
          },
          customVariant: {
            type: 'string',
            enum: ['dip', 'board'],
            description: 'Only when model="custom".',
          },
          customPinNames: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Only when model="custom": pin names top-to-bottom on the left, then top-to-bottom on the right. Defaults to P1..PN.',
          },
        },
        required: ['model'],
      }),
      execute: exec('add_ic'),
    }),
    connect: tool({
      description:
        'Wire two component ports together. Use list_components to discover valid port ids. Returns { edgeId }.',
      inputSchema: jsonSchema({
        type: 'object',
        properties: {
          sourceReference: {
            type: 'string',
            description: 'Reference of the source component, e.g. "R1".',
          },
          sourcePort: {
            type: 'string',
            description:
              'Port id on the source. Discrete: port-a / port-b / port-anode / port-cathode / port-pos / port-neg / port-net. ICs: pin-1, pin-2, …',
          },
          targetReference: { type: 'string' },
          targetPort: { type: 'string' },
        },
        required: ['sourceReference', 'sourcePort', 'targetReference', 'targetPort'],
      }),
      execute: exec('connect'),
    }),
    delete_component: tool({
      description: 'Remove a component (and all of its connected wires) from the diagram.',
      inputSchema: jsonSchema({
        type: 'object',
        properties: { reference: { type: 'string' } },
        required: ['reference'],
      }),
      execute: exec('delete_component'),
    }),
    update_component: tool({
      description:
        'Update properties (value, model, color, voltage, description, etc.) on an existing component.',
      inputSchema: jsonSchema({
        type: 'object',
        properties: {
          reference: { type: 'string' },
          fields: {
            type: 'object',
            additionalProperties: true,
            description:
              'Partial data update. Common fields: value, tolerance, model, color, voltage, netName, description.',
          },
        },
        required: ['reference', 'fields'],
      }),
      execute: exec('update_component'),
    }),
  };
}

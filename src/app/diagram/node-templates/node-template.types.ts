/**
 * Node Template Types - Enum defining all custom node types
 *
 * Each type corresponds to a custom Angular component that renders that node.
 * These types are used in:
 * - node-template-map.ts: Maps types to component classes
 * - palette-data.ts: Defines what type each palette item creates
 * - Node.type property: Identifies which component to use for rendering
 *
 * ng-diagram uses the type property to look up the component from
 * the nodeTemplateMap and render it for each node.
 */
export enum NodeTemplateType {
  /** Trigger node - Represents workflow initiators with icon and description */
  Trigger = 'trigger',

  /** Custom node - Represents tasks with status dropdown */
  Custom = 'custom',

  /** Group node - Container node that can hold other nodes */
  Group = 'group',
}

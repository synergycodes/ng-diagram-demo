import { NgDiagramPaletteItem } from 'ng-diagram';
import { PaletteData } from '../types';
import { NodeTemplateType } from './node-templates/node-template.types';

/**
 * Palette Model - Defines draggable items in the palette sidebar
 *
 * This demonstrates how to define palette items for ng-diagram's drag & drop system.
 *
 * Key concepts:
 * 1. NgDiagramPaletteItem<T>: Generic type for palette items
 *    - type: Maps to a node template component (see node-template-map.ts)
 *    - data: Custom data passed to the node when created
 *    - isGroup: (optional) Whether this creates a group node that can contain other nodes
 *
 * 2. Drag & Drop Flow:
 *    a. User drags a palette item (NgDiagramPaletteItemComponent handles the drag)
 *    b. During drag, NgDiagramPaletteItemPreviewComponent shows a preview
 *    c. On drop, ng-diagram creates a new node with this item's type and data
 *    d. The node is rendered using the component from node-template-map
 *    e. PaletteItemDroppedEvent is emitted
 *
 * 3. Custom Data (PaletteData):
 *    - label: Display name for the node
 *    - description: Help text shown in palette
 *    - icon: Phosphor icon class
 *    - status: (optional) Custom property for specific node types
 *
 * Usage: Pass this array to the palette component's model input
 */
export const paletteModel: NgDiagramPaletteItem<PaletteData>[] = [
  {
    // Trigger Node: Represents a workflow initiator
    type: NodeTemplateType.Trigger,
    data: {
      label: 'Trigger',
      description: 'Initiate workflows',
      icon: 'ph-lightning',
    },
  },
  {
    // Task Status Node: Represents a task with a status
    type: NodeTemplateType.Custom,
    data: {
      label: 'Task Status',
      description: 'Track task progress',
      icon: 'ph-check-circle',
      status: 'pending',
    },
  },
  {
    // Group Node: Special node that can contain other nodes
    // isGroup: true enables parent-child relationships
    type: NodeTemplateType.Group,
    data: {
      label: 'Group',
      description: 'Group nodes together',
      icon: 'ph-squares-four',
    },
    isGroup: true, // Marks this as a container node
  },
];

import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgDiagramPaletteItem } from 'ng-diagram';
import { PaletteItemComponent } from '../palette-item/palette-item.component';
import { PaletteData } from '../../../types';
import { nodeTemplateMap } from '../../node-template-map';

/**
 * PaletteItemPreviewComponent - Custom drag preview shown while dragging
 *
 * This demonstrates how to create a custom drag preview for ng-diagram palette items.
 *
 * Drag Preview Concepts:
 *
 * 1. Default Behavior (without custom preview):
 *    - Browser shows a ghosted copy of the dragged element
 *    - Limited styling control
 *
 * 2. Custom Preview (with NgDiagramPaletteItemPreviewComponent):
 *    - Full control over preview appearance
 *    - Can show actual node template during drag
 *    - Can scale preview to match diagram zoom
 *    - Better user experience
 *
 * Shows the actual node template using NgComponentOutlet
 * (renders the same component that will appear on the diagram)
 *
 * Template mapping:
 * - Uses nodeTemplateMap to look up the component for each node type
 * - NgComponentOutlet dynamically renders that component
 * - Component receives the item as input (via template)
 */
@Component({
  selector: 'app-palette-item-preview',
  templateUrl: './palette-item-preview.component.html',
  imports: [NgComponentOutlet, PaletteItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaletteItemPreviewComponent {
  /** The palette item being dragged */
  item = input.required<NgDiagramPaletteItem<PaletteData>>();

  /**
   * Computed: Component type for rendering the actual node template
   *
   * Looks up the component from nodeTemplateMap based on item.type
   * Returns undefined if type is not found (fallback to palette item UI)
   *
   * See node-template-map.ts for the mapping configuration
   */
  componentType = computed(() => nodeTemplateMap.get(this.item().type || ''));
}

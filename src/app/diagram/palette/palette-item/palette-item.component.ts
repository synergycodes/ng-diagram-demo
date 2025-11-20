import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgDiagramPaletteItem } from 'ng-diagram';
import { PaletteData } from '../../../types';

/**
 * PaletteItemComponent - Displays a single palette item in the sidebar
 *
 * This is a presentational component that shows how a palette item looks
 * before being dragged. It extracts data from NgDiagramPaletteItem and
 * displays it in a user-friendly format.
 *
 * The component is wrapped by NgDiagramPaletteItemComponent directive
 * which adds the drag & drop functionality.
 *
 * Note: This component is purely for display in the palette sidebar.
 * When dropped on the diagram, the node is rendered using the component
 * specified in node-template-map.ts based on the item's type.
 */
@Component({
  selector: 'app-palette-item',
  templateUrl: './palette-item.component.html',
  styleUrls: ['./palette-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaletteItemComponent {
  /** The palette item configuration containing type and data */
  item = input.required<NgDiagramPaletteItem<PaletteData>>();

  /** Computed: Node label to display (e.g., "Trigger", "Task Status") */
  nodeLabel = computed(() => this.item()?.data?.['label'] ?? 'Unknown');

  /** Computed: Node description for help text */
  nodeDescription = computed(
    () => this.item()?.data?.['description'] ?? 'No description',
  );

  /** Computed: Icon class for Phosphor icons (e.g., "ph ph-lightning") */
  nodeIcon = computed(
    () => `ph ${this.item()?.data?.['icon'] ?? 'ph-placeholder'}`,
  );
}

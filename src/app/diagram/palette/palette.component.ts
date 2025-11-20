import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import {
  NgDiagramPaletteItem, // Type for palette item configuration
  NgDiagramPaletteItemComponent, // Directive that makes an element draggable to the diagram
  NgDiagramPaletteItemPreviewComponent, // Component host for custom drag preview
  NgDiagramViewportService, // Service to access current zoom scale
} from 'ng-diagram';
import { PaletteItemPreviewComponent } from './palette-item-preview/palette-item-preview.component';
import { PaletteItemComponent } from './palette-item/palette-item.component';
import { SidebarComponent } from '../../ui-components/sidebar/sidebar.component';
import { PaletteData } from '../../types';

/**
 * PaletteComponent - Sidebar containing draggable node templates
 *
 * This demonstrates ng-diagram's drag & drop palette system using:
 * - NgDiagramPaletteItemComponent: Directive applied to each palette item
 * - NgDiagramPaletteItemPreviewComponent: Container for custom drag preview
 *
 * How ng-diagram Palette Works:
 *
 * 1. Setup (in template):
 *    <ng-diagram-palette-item [item]="paletteItem">
 *      <app-palette-item [item]="paletteItem" /> <!-- Your custom UI -->
 *    </ng-diagram-palette-item>
 *
 * 2. Drag Start:
 *    - User starts dragging a palette item
 *    - NgDiagramPaletteItemComponent sets up HTML5 drag & drop
 *    - Preview is shown (either custom or default)
 *
 * 3. Drag Over Diagram:
 *    - ng-diagram detects valid drop zone
 *    - Converts mouse position to flow coordinates
 *
 * 4. Drop:
 *    - ng-diagram creates a new node at drop position
 *    - Node gets: type, data, and position from palette item + drop location
 *    - New node is automatically added to the model
 *    - PaletteItemDroppedEvent is emitted
 *
 * 5. Custom Preview:
 *    Use NgDiagramPaletteItemPreviewComponent to show custom preview during drag:
 *    <ng-diagram-palette-item-preview [item]="paletteItem">
 *      <app-palette-item-preview [item]="paletteItem" />
 *    </ng-diagram-palette-item-preview>
 *
 * Key Features:
 * - Zero configuration drag & drop (directives handle all mechanics)
 * - Automatic coordinate transformation (screen to diagram space)
 * - Custom preview support
 * - Respects zoom level (scale) for accurate positioning
 */
@Component({
  selector: 'app-palette',
  templateUrl: './palette.component.html',
  styleUrls: ['./palette.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgDiagramPaletteItemComponent, // Makes elements draggable to diagram
    NgDiagramPaletteItemPreviewComponent, // Hosts custom drag preview
    PaletteItemComponent, // Custom UI for palette items in sidebar
    PaletteItemPreviewComponent, // Custom UI for drag preview
    SidebarComponent,
  ],
})
export class PaletteComponent {
  /**
   * Array of palette items to display
   * Each item defines a node type that can be dragged onto the diagram
   */
  model = input.required<NgDiagramPaletteItem<PaletteData>[]>();

  /**
   * Current diagram zoom scale
   * Used to scale the preview to match diagram zoom level
   */
  scale = inject(NgDiagramViewportService).scale;
}

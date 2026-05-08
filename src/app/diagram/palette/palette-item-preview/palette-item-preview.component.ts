import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, Type } from '@angular/core';
import { NgDiagramNodeTemplate } from 'ng-diagram';
import { CircuitPaletteEntry } from '../../../circuit/palette-data';
import { PaletteItemComponent } from '../palette-item/palette-item.component';
import { nodeTemplateMap } from '../../node-template-map';

/**
 * Drag preview that renders the actual node template, falling back to the
 * palette card if the type is not registered (shouldn't happen in practice).
 */
@Component({
  selector: 'app-palette-item-preview',
  templateUrl: './palette-item-preview.component.html',
  imports: [NgComponentOutlet, PaletteItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaletteItemPreviewComponent {
  entry = input.required<CircuitPaletteEntry>();

  componentType = computed(() => {
    const type = this.entry().ngItem.type;
    return nodeTemplateMap.get(type ?? '') as Type<NgDiagramNodeTemplate> | undefined;
  });

  /** Fake node passed as input to the rendered template. */
  previewNode = computed(() => ({
    id: '__preview',
    type: this.entry().ngItem.type,
    position: { x: 0, y: 0 },
    data: this.entry().ngItem.data,
  }));
}

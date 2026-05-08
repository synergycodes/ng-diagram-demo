import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgDiagramModelService, NgDiagramViewportService, Node } from 'ng-diagram';
import { computeIcNodeSize } from './palette-data';
import { CustomIcDialogComponent, CustomIcResult } from './custom-ic-dialog/custom-ic-dialog.component';
import { CircuitNodeType, IcData } from './circuit-types';

/**
 * Opens the Custom IC dialog and, on confirmation, drops the configured IC at
 * the center of the current viewport. Reference is set to "U?" / "A?" — the
 * diagram component's auto-numbering hook then promotes it to a unique value.
 */
/**
 * Provided by `DiagramComponent` (not root) because it depends on
 * `NgDiagramModelService` / `NgDiagramViewportService`, which are scoped to
 * that component via `provideNgDiagram()`.
 */
@Injectable()
export class CustomIcLauncherService {
  private readonly dialog = inject(MatDialog);
  private readonly modelService = inject(NgDiagramModelService);
  private readonly viewportService = inject(NgDiagramViewportService);

  open() {
    const ref = this.dialog.open<CustomIcDialogComponent, void, CustomIcResult>(
      CustomIcDialogComponent,
      { panelClass: 'custom-ic-dialog-panel' },
    );
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.spawnNode(result);
    });
  }

  private spawnNode(result: CustomIcResult) {
    const referencePrefix = result.nodeType === CircuitNodeType.Board ? 'A' : 'U';

    const data: IcData = {
      ...result.data,
      reference: `${referencePrefix}${this.nextRefSuffix(referencePrefix)}`,
    };

    const size = computeIcNodeSize(data);

    // Drop at the center of the visible viewport area.
    const center = this.centerOfViewport(size);

    const node: Node<IcData> = {
      id: `custom-ic-${Date.now()}`,
      type: result.nodeType,
      position: center,
      autoSize: false,
      size,
      data,
    };

    this.modelService.addNodes([node]);
  }

  private nextRefSuffix(prefix: string): number {
    const re = new RegExp(`^${prefix}(\\d+)$`);
    let max = 0;
    for (const n of this.modelService.nodes()) {
      const ref = (n.data as { reference?: string })?.reference;
      const m = ref?.match(re);
      if (m) max = Math.max(max, Number(m[1]));
    }
    return max + 1;
  }

  /**
   * The viewport service exposes flow-coordinate transforms; we use the size
   * to offset the new node so its center sits at the visible center.
   */
  private centerOfViewport(size: { width: number; height: number }) {
    const rect = document.querySelector('ng-diagram')?.getBoundingClientRect();
    if (!rect) return { x: 100, y: 100 };
    const screenCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    const flowCenter = this.viewportService.clientToFlowPosition(screenCenter);
    return {
      x: flowCenter.x - size.width / 2,
      y: flowCenter.y - size.height / 2,
    };
  }
}

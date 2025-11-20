import { Component, HostListener, inject, output } from '@angular/core';
import { ContextMenuService } from './context-menu.service';

export interface PasteEvent {
  x: number;
  y: number;
}

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
})
export class ContextMenuComponent {
  private contextMenuService = inject(ContextMenuService);

  showMenu = this.contextMenuService.visibility;
  menuPosition = this.contextMenuService.menuPosition;
  nodeContext = this.contextMenuService.nodeContext;

  copyClick = output<void>();
  cutClick = output<void>();
  pasteClick = output<PasteEvent>();
  deleteClick = output<void>();
  bringToFrontClick = output<void>();
  sendToBackClick = output<void>();

  @HostListener('document:click')
  closeMenu() {
    this.contextMenuService.hideMenu();
  }

  onCopy() {
    this.copyClick.emit();
  }

  onCut() {
    this.cutClick.emit();
  }

  onPaste(event: MouseEvent) {
    this.pasteClick.emit({
      x: event.clientX,
      y: event.clientY,
    });
  }

  onDelete() {
    this.deleteClick.emit();
  }

  onBringToFront() {
    this.bringToFrontClick.emit();
  }

  onSendToBack() {
    this.sendToBackClick.emit();
  }
}

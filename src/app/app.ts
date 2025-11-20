import { Component, inject, OnDestroy } from '@angular/core';
import { DiagramComponent } from './diagram/diagram.component';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DiagramComponent],
  template: `<app-diagram />`,
})
export class App implements OnDestroy {
  private readonly themeService = inject(ThemeService);

  ngOnDestroy(): void {
    this.themeService.destroy();
  }
}

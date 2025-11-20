import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngd-top-navbar',
  imports: [CommonModule],
  templateUrl: './top-navbar.component.html',
  styleUrl: './top-navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopNavbarComponent {}

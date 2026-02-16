import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  inject,
  computed,
  ChangeDetectionStrategy,
  output,
  input,
  signal,
} from '@angular/core';
import { TopNavbarComponent } from '../top-navbar/top-navbar.component';
import { type SegmentPickerButton, SegmentPickerComponent } from '../segment-picker/segment-picker.component';
import { NavButtonComponent } from '../nav-button/nav-button.component';
import { ThemeService } from '../../theme.service';

export type BackgroundType = 'solid' | 'dots' | 'grid';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    FormsModule,
    TopNavbarComponent,
    SegmentPickerComponent,
    NavButtonComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  private readonly themeService = inject(ThemeService);

  readonly themeButtons: SegmentPickerButton[] = [
    { id: 'light', icon: 'ph-sun', title: 'Light Theme' },
    { id: 'dark', icon: 'ph-moon', title: 'Dark Theme' },
  ];

  readonly logoSrc = computed(() =>
    this.themeService.currentTheme() === 'dark'
      ? 'ng-diagram-logo-white.svg'
      : 'ng-diagram-logo-black.svg',
  );

  readonly currentTheme = this.themeService.currentTheme;

  toggleDebugModeClick = output<void>();
  backgroundTypeChange = output<BackgroundType>();
  searchNodeClick = output<string>();

  isDebugMode = input.required<boolean>();
  backgroundType = input<BackgroundType>('dots');

  searchQuery = signal('');

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  setBackgroundType(type: BackgroundType) {
    this.backgroundTypeChange.emit(type);
  }

  onSearch() {
    const query = this.searchQuery();
    if (query.trim()) {
      this.searchNodeClick.emit(query.trim());
    }
  }
}

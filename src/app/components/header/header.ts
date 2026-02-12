import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
})
export class Header {
  private themeService = inject(ThemeService);

  isDarkMode = this.themeService.isDarkMode;

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  get ariaLabel() {
    return this.isDarkMode() ? $localize`Switch to light mode` : $localize`Switch to dark mode`;
  }
}

import { Injectable, signal, inject, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);

  // Signal for dark mode state - reactive and can be used in templates
  isDarkMode = signal(false);

  constructor() {
    // Initialize theme on service creation
    this.initializeTheme();

    // Effect to apply theme changes to the DOM
    effect(() => {
      const isDark = this.isDarkMode();
      console.log('Theme effect running, isDark:', isDark);
      this.updateTheme(isDark);
    });
  }

  private initializeTheme() {
    // Always default to light mode to prevent being stuck in dark theme
    this.isDarkMode.set(false);
  }

  /**
   * Toggle between light and dark mode
   * Updates the signal, localStorage, and DOM classes
   */
  toggleDarkMode() {
    const newMode = !this.isDarkMode();
    console.log('Toggling theme from', this.isDarkMode(), 'to', newMode);
    this.isDarkMode.set(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  }

  private updateTheme(isDark: boolean) {
    console.log('Updating theme DOM, isDark:', isDark);
    if (isDark) {
      this.document.documentElement.classList.add('dark');
      console.log('Added dark class');
    } else {
      this.document.documentElement.classList.remove('dark');
      console.log('Removed dark class');
    }
  }
}

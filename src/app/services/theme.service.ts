import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public isDarkMode = signal<boolean>(true);

  constructor() {
    const savedTheme = localStorage.getItem('calibro-theme');
    if (savedTheme === 'light') {
      this.setTheme(false);
    } else {
      this.setTheme(true);
    }
  }

  toggleTheme() {
    this.setTheme(!this.isDarkMode());
  }

  setTheme(isDark: boolean) {
    this.isDarkMode.set(isDark);
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('calibro-theme', theme);
  }
}

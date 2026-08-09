import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  public isMobileSidebarOpen = signal<boolean>(false);
  public isSidebarCollapsed = signal<boolean>(false);

  toggleMobileSidebar() {
    this.isMobileSidebarOpen.set(!this.isMobileSidebarOpen());
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen.set(false);
  }

  toggleSidebarCollapse() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }
}

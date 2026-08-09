import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  public authService = inject(AuthService);
  public layoutService = inject(LayoutService);
  private router = inject(Router);

  // Single active group signal (accordion mode: 1 open at a time, 'transactions' default)
  public activeGroup = signal<string>('transactions');

  toggleGroup(groupName: string) {
    if (this.activeGroup() === groupName) {
      this.activeGroup.set('');
    } else {
      this.activeGroup.set(groupName);
    }
  }

  isOpen(groupName: string): boolean {
    return this.activeGroup() === groupName;
  }

  onLogout() {
    this.layoutService.closeMobileSidebar();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

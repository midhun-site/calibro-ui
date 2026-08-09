import { Component, computed, inject, signal, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { LayoutService } from '../../services/layout.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  icon: string;
  severity: string;
  unread: boolean;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  public themeService = inject(ThemeService);
  public layoutService = inject(LayoutService);
  public authService = inject(AuthService);
  public toastService = inject(ToastService);
  private elementRef = inject(ElementRef);
  private router = inject(Router);

  public isNotificationOpen = signal<boolean>(false);
  public isProfileMenuOpen = signal<boolean>(false);

  public notifications = signal<NotificationItem[]>([
    {
      id: 1,
      title: 'Calibration Overdue Alert',
      message: 'Asset EQ-TEMP-002 (Precision Temp Calibrator) is 10 days overdue.',
      time: '10m ago',
      icon: 'pi-exclamation-triangle',
      severity: 'danger',
      unread: true
    },
    {
      id: 2,
      title: 'Work Order Assigned',
      message: 'Work order WO-2026-001 assigned to Alex Rivera (Metrologist).',
      time: '1h ago',
      icon: 'pi-briefcase',
      severity: 'info',
      unread: true
    },
    {
      id: 3,
      title: 'Certificate Approved',
      message: 'CERT-2026-8891 approved by Dr. Marcus Vance.',
      time: '3h ago',
      icon: 'pi-verified',
      severity: 'success',
      unread: false
    },
    {
      id: 4,
      title: 'New Account Created',
      message: 'BioPharm Solutions customer account registered.',
      time: '1d ago',
      icon: 'pi-building',
      severity: 'primary',
      unread: false
    }
  ]);

  public unreadCount = computed(() => this.notifications().filter(n => n.unread).length);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Close notification dropdown if clicked outside
    if (this.isNotificationOpen() && !this.elementRef.nativeElement.querySelector('.notification-wrapper')?.contains(target)) {
      this.isNotificationOpen.set(false);
    }

    // Close profile dropdown if clicked outside
    if (this.isProfileMenuOpen() && !this.elementRef.nativeElement.querySelector('.profile-wrapper')?.contains(target)) {
      this.isProfileMenuOpen.set(false);
    }
  }

  toggleNotifications() {
    this.isProfileMenuOpen.set(false);
    this.isNotificationOpen.set(!this.isNotificationOpen());
  }

  toggleProfileMenu() {
    this.isNotificationOpen.set(false);
    this.isProfileMenuOpen.set(!this.isProfileMenuOpen());
  }

  markAsRead(id: number) {
    this.notifications.update(items =>
      items.map(n => (n.id === id ? { ...n, unread: false } : n))
    );
  }

  markAllAsRead() {
    this.notifications.update(items =>
      items.map(n => ({ ...n, unread: false }))
    );
  }

  onProfileClick() {
    this.isProfileMenuOpen.set(false);
    this.toastService.showInfo('User Profile', 'Logged in as Alex Rivera (Senior Metrologist).');
    this.router.navigate(['/user-management/user-permissions']);
  }

  onLogout() {
    this.isProfileMenuOpen.set(false);
    this.authService.logout();
    this.toastService.showInfo('Logged Out', 'You have been signed out safely.');
    this.router.navigate(['/login']);
  }
}

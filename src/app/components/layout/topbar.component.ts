import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { LayoutService } from '../../services/layout.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { NotificationService, NotificationItem } from '../../services/notification.service';
import { AiChatComponent } from './ai-chat.component';

export type { NotificationItem } from '../../services/notification.service';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  quickAction?: { label: string; route: string };
}

/**
 * Topbar header component displaying global search, AI drawer toggle, theme switcher,
 * real-time SignalR notifications dropdown, and user authentication profile controls.
 */
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, AiChatComponent],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  public themeService = inject(ThemeService);
  public layoutService = inject(LayoutService);
  public authService = inject(AuthService);
  public toastService = inject(ToastService);
  public notificationService = inject(NotificationService);
  private elementRef = inject(ElementRef);
  private router = inject(Router);

  public isNotificationOpen = signal<boolean>(false);
  public isProfileMenuOpen = signal<boolean>(false);
  public isAiChatOpen = signal<boolean>(false);

  // Bind reactive signals directly from NotificationService
  public notifications = this.notificationService.notifications;
  public unreadCount = this.notificationService.unreadCount;

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

    // Close AI Chat drawer if clicked outside
    if (this.isAiChatOpen() && !this.elementRef.nativeElement.querySelector('.ai-chat-wrapper')?.contains(target)) {
      this.isAiChatOpen.set(false);
    }
  }

  toggleNotifications() {
    this.isProfileMenuOpen.set(false);
    this.isAiChatOpen.set(false);
    this.isNotificationOpen.set(!this.isNotificationOpen());
  }

  toggleProfileMenu() {
    this.isNotificationOpen.set(false);
    this.isAiChatOpen.set(false);
    this.isProfileMenuOpen.set(!this.isProfileMenuOpen());
  }

  toggleAiChat() {
    this.isNotificationOpen.set(false);
    this.isProfileMenuOpen.set(false);
    this.isAiChatOpen.set(!this.isAiChatOpen());
  }

  markAsRead(id: string | number) {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  /**
   * Handles click on notification link button or item, marking as read and navigating to destination route.
   * @param item The notification item payload.
   * @param event Optional mouse event to stop propagation.
   */
  navigateTo(item: NotificationItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.notificationService.markAsRead(item.id);
    this.isNotificationOpen.set(false);

    if (item.actionUrl) {
      this.router.navigateByUrl(item.actionUrl);
    }
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

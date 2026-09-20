import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  time: string;
  icon: string;
  severity: string;
  unread: boolean;
  actionUrl?: string;
  actionLabel?: string;
  category?: string;
  data?: any;
}

/**
 * Service managing real-time SignalR WebSocket connectivity, incoming notification events,
 * and reactive unread state for the CaliBro topbar notification panel.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  private hubConnection: HubConnection | null = null;
  public isConnected = signal<boolean>(false);

  // Initial seed notifications list
  public notifications = signal<NotificationItem[]>([
    {
      id: 'seed-1',
      title: 'Calibration Overdue Alert',
      message: 'Asset EQ-TEMP-002 (Precision Temp Calibrator) is 10 days overdue.',
      time: '10m ago',
      icon: 'pi-exclamation-triangle',
      severity: 'danger',
      unread: true,
      actionUrl: '/equipment/recalibration-reminders',
      actionLabel: 'View Overdue Items'
    },
    {
      id: 'seed-2',
      title: 'Work Order Assigned',
      message: 'Work order WO-2026-001 assigned to Alex Rivera (Metrologist).',
      time: '1h ago',
      icon: 'pi-briefcase',
      severity: 'info',
      unread: true,
      actionUrl: '/transactions/workorder',
      actionLabel: 'Open Work Order'
    },
    {
      id: 'seed-3',
      title: 'Certificate Approved',
      message: 'CERT-2026-8891 approved by Dr. Marcus Vance.',
      time: '3h ago',
      icon: 'pi-verified',
      severity: 'success',
      unread: false,
      actionUrl: '/certificates',
      actionLabel: 'View Certificate'
    },
    {
      id: 'seed-4',
      title: 'New Account Created',
      message: 'BioPharm Solutions customer account registered.',
      time: '1d ago',
      icon: 'pi-building',
      severity: 'primary',
      unread: false,
      actionUrl: '/customers',
      actionLabel: 'View Customers'
    }
  ]);

  public unreadCount = computed(() => this.notifications().filter(n => n.unread).length);

  constructor() {
    // Start SignalR connection on service initialization
    this.startConnection();

    // Re-negotiate or reconnect when user login state changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user && (!this.hubConnection || this.hubConnection.state === 'Disconnected')) {
        this.startConnection();
      }
    });
  }

  /**
   * Initializes and starts the SignalR WebSocket connection to /hubs/notifications.
   */
  public startConnection(): void {
    if (this.hubConnection && this.hubConnection.state !== 'Disconnected') {
      return;
    }

    const baseUrl = environment.apiUrl.replace(/\/api\/v1\.0\/?$/, '');
    const hubUrl = `${baseUrl}/hubs/notifications`;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => this.authService.getAccessToken() || '',
        transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    // Register event listeners
    this.registerSignalrEvents();

    this.hubConnection
      .start()
      .then(() => {
        this.isConnected.set(true);
      })
      .catch(() => {
        this.isConnected.set(false);
      });

    this.hubConnection.onreconnecting(() => {
      this.isConnected.set(false);
    });

    this.hubConnection.onreconnected(() => {
      this.isConnected.set(true);
    });

    this.hubConnection.onclose(() => {
      this.isConnected.set(false);
    });
  }

  /**
   * Registers incoming server message handlers.
   */
  private registerSignalrEvents(): void {
    if (!this.hubConnection) return;

    // Handle generic broadcast notifications
    this.hubConnection.on('ReceiveNotification', (payload: any) => {
      this.handleIncomingNotification(payload);
    });

    // Handle dedicated EnquiryCreated event if sent directly
    this.hubConnection.on('EnquiryCreated', (payload: any) => {
      this.handleIncomingNotification({
        id: payload.id || `enq-${Date.now()}`,
        title: 'New Enquiry Received',
        message: payload.message || `Enquiry #${payload.enquiryNo} registered.`,
        time: 'Just now',
        icon: 'pi-file-edit',
        severity: 'info',
        unread: true,
        actionUrl: `/transactions/enquiry/add/${payload.enquiryId || payload.id}`,
        actionLabel: 'View Enquiry',
        category: 'enquiry',
        data: payload
      });
    });
  }

  /**
   * Processes an incoming notification, adds it to the store, and shows a toast alert.
   */
  public handleIncomingNotification(payload: any): void {
    const item: NotificationItem = {
      id: payload.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: payload.title || 'System Notification',
      message: payload.message || '',
      time: payload.time || 'Just now',
      icon: payload.icon || 'pi-bell',
      severity: payload.severity || 'info',
      unread: payload.unread !== undefined ? payload.unread : true,
      actionUrl: payload.actionUrl || (payload.data?.enquiryId ? `/transactions/enquiry/add/${payload.data.enquiryId}` : undefined),
      actionLabel: payload.actionLabel || (payload.category === 'enquiry' ? 'View Enquiry' : 'View Details'),
      category: payload.category,
      data: payload.data
    };

    // Prepend new notification to the top of the list
    this.notifications.update(list => [item, ...list]);

    // Show instant toast notification
    if (item.severity === 'success') {
      this.toastService.showSuccess(item.title, item.message);
    } else if (item.severity === 'danger') {
      this.toastService.showError(item.title, item.message);
    } else {
      this.toastService.showInfo(item.title, item.message);
    }
  }

  /**
   * Marks a specific notification as read.
   * @param id Notification ID.
   */
  public markAsRead(id: string | number): void {
    this.notifications.update(items =>
      items.map(n => (n.id === id ? { ...n, unread: false } : n))
    );
  }

  /**
   * Marks all notifications as read.
   */
  public markAllAsRead(): void {
    this.notifications.update(items =>
      items.map(n => ({ ...n, unread: false }))
    );
  }

  /**
   * Cleans up the connection when needed.
   */
  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().catch(() => {});
      this.hubConnection = null;
      this.isConnected.set(false);
    }
  }
}

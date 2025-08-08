import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { SocketService, NotificationEvent } from '../../../core/services/socket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  template: `
    <div class="notification-bell">
      <!-- Bouton cloche -->
      <button 
        class="notification-bell-btn" 
        (click)="toggleNotifications($event)"
        [class.has-notifications]="hasUnreadNotifications"
      >
        <span class="bell-icon">🔔</span>
        
        <!-- Badge pour notifications non lues -->
        <span 
          *ngIf="unreadCount > 0" 
          class="notification-badge"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>

      <!-- Panneau des notifications -->
      <div 
        *ngIf="showNotifications" 
        class="notification-panel"
        (click)="$event.stopPropagation()"
      >
        <div class="notification-header">
          <h6 class="mb-0">Notifications</h6>
          <button 
            *ngIf="notifications.length > 0"
            class="mark-all-read-btn" 
            (click)="markAllAsRead()"
          >
            Tout marquer comme lu
          </button>
        </div>

        <div class="notification-list">
          <div 
            *ngFor="let notification of notifications" 
            class="notification-item"
            [class.unread]="!notification.read"
            (click)="markAsRead(notification.id)"
          >
            <div class="notification-icon">
              <span *ngIf="notification.type === 'new_comment'">💬</span>
              <span *ngIf="notification.type === 'comment_reply'">↩️</span>
              <span *ngIf="notification.type === 'custom'">🔔</span>
            </div>
            
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">
                {{ formatTime(notification.createdAt) }}
              </div>
            </div>
          </div>

          <div *ngIf="notifications.length === 0" class="no-notifications">
            Aucune notification
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-bell {
      position: relative;
      display: inline-block;
    }

    .notification-bell-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.3s ease;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
      min-height: 40px;
    }

    .notification-bell-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
      transform: scale(1.1);
    }

    .notification-bell-btn.has-notifications {
      color: #ffc107;
    }

    .bell-icon {
      font-size: 1.2rem;
      line-height: 1;
      display: block;
    }

    .notification-badge {
      position: absolute;
      top: 0;
      right: 0;
      background-color: #dc3545;
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 0.7rem;
      font-weight: bold;
      min-width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate(50%, -50%);
    }

    .notification-panel {
      position: absolute;
      top: 100%;
      right: 0;
      width: 350px;
      max-height: 400px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      overflow: hidden;
      margin-top: 8px;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      background: #f8f9fa;
    }

    .notification-header h6 {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    .mark-all-read-btn {
      background: none;
      border: 1px solid #6c757d;
      color: #6c757d;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .mark-all-read-btn:hover {
      background-color: #6c757d;
      color: white;
    }

    .notification-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .notification-item:hover {
      background-color: #f8f9fa;
    }

    .notification-item.unread {
      background-color: #e3f2fd;
    }

    .notification-item:last-child {
      border-bottom: none;
    }

    .notification-icon {
      margin-right: 12px;
      color: #007bff;
      font-size: 1.2em;
      display: flex;
      align-items: center;
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      margin-bottom: 4px;
      color: #333;
    }

    .notification-message {
      font-size: 0.9em;
      color: #666;
      margin-bottom: 4px;
      line-height: 1.4;
    }

    .notification-time {
      font-size: 0.8em;
      color: #999;
    }

    .no-notifications {
      text-align: center;
      color: #999;
      padding: 20px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .notification-panel {
        width: 300px;
        right: -50px;
      }
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: (NotificationEvent & { id: string; read: boolean })[] = [];
  showNotifications = false;
  unreadCount = 0;
  hasUnreadNotifications = false;
  isConnected = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private socketService: SocketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeSocket();
    this.subscribeToNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Fermer le panneau si on clique à l'extérieur
    if (this.showNotifications) {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-bell')) {
        this.showNotifications = false;
      }
    }
  }

  private async initializeSocket(): Promise<void> {
    try {
      const token = this.authService.getToken();
      if (token) {
        this.socketService.connect(token);
        
        // Écouter le statut de connexion
        const connectionSub = this.socketService.getConnectionStatus()
          .subscribe(connected => {
            this.isConnected = connected;
            console.log('🔌 Statut de connexion Socket.io:', connected);
          });

        this.subscriptions.push(connectionSub);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation Socket.io:', error);
    }
  }

  private subscribeToNotifications(): void {
    // Écouter les notifications
    const notificationSub = this.socketService.notification$.subscribe(notification => {
      if (notification) {
        console.log('🔔 Nouvelle notification reçue:', notification);
        this.addNotification(notification);
      }
    });

    this.subscriptions.push(notificationSub);
  }

  private addNotification(notification: NotificationEvent): void {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: notification.createdAt || new Date()
    };

    this.notifications.unshift(newNotification);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
    this.hasUnreadNotifications = this.unreadCount > 0;
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.updateUnreadCount();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.updateUnreadCount();
  }

  formatTime(timestamp: Date | string | undefined): string {
    if (!timestamp) return 'À l\'instant';
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return date.toLocaleDateString();
  }
} 
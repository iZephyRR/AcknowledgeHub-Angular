import { Component, ChangeDetectorRef } from '@angular/core';
import { WebSocketService } from 'src/app/services/websocket/web-socket.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
})
export class NotificationComponent {
  notifications: any[] = [];
  unreadCount: number = 0;

  constructor(private websocketService: WebSocketService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.websocketService.notifications$.subscribe(notify => {
      if (notify) {
        this.notifications.push(notify);
        this.unreadCount++; // Increment unread count when a new notification is received
        this.cd.detectChanges(); // Manually trigger change detection
      }
    });
    this.websocketService.connect();
  }

  markAllAsRead() {
    this.unreadCount = 0; // Reset the unread count when marking all as read
    this.cd.detectChanges(); // Manually trigger change detection
  }
}

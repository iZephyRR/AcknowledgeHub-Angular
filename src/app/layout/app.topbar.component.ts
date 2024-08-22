import { Component, ElementRef, ViewChild, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { AppComponent } from '../app.component';
import { MenuService } from './app.menu.service';
import { ChangeDetectorRef } from '@angular/core';
import { NotificationService } from '../services/notifications/notification service';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
})
export class AppTopBarComponent implements OnInit {
  items!: MenuItem[];
  unreadCount: number = 0; // Unread notification count
  notifications: any[] = []; // Notifications array
  showNotifications: boolean = false; // Toggle for notification dropdown

  @ViewChild('menubutton') menuButton!: ElementRef;
  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
  @ViewChild('topbarmenu') menu!: ElementRef;

  @Input() minimal: boolean = false;

  scales: number[] = [12, 13, 14, 15, 16];

  constructor(
    public layoutService: LayoutService,
    public menuService: MenuService,
    private notificationService: NotificationService, // Inject NotificationService
    private cd: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Subscribe to unread count
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
      this.cd.detectChanges(); // Detect changes to update view
    });

    // Subscribe to notifications
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications.map(notification => ({
        ...notification,
        message: `Announcement #${notification.announcementId} titled "${notification.title}" was sent on ${new Date(notification.noticeAt).toLocaleDateString()} to category #${notification.category} by user #${notification.createdBy}. Status: ${notification.status}, Type: ${notification.type}.`,
      }));
      this.cd.detectChanges();
    });
  }

  toggleNotificationDropdown(): void {
    this.showNotifications = !this.showNotifications;
    this.cd.detectChanges(); // Detect changes to update view
  }

  markAsRead(notification: any): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id); // Mark notification as read in service
      notification.isRead = true; // Update notification status in the component
      this.unreadCount--; // Decrement unread count
      this.cd.detectChanges(); // Detect changes to update view
    }
  }

  markAllAsRead(): void {
    // Mark all notifications as read in the service
    this.notificationService.markAllAsRead();

    // Immediately update all notifications in the component
    this.notifications.forEach(notification => (notification.isRead = true));

    // Reset unread count to 0
    this.unreadCount = 0;

    // Close the notification dropdown
    this.showNotifications = false;

    // Trigger change detection to update the view
    this.cd.detectChanges();
  }

  // Getters and setters for layout configuration
  get visible(): boolean {
    return this.layoutService.state.configSidebarVisible;
  }

  set visible(_val: boolean) {
    this.layoutService.state.configSidebarVisible = _val;
  }

  get scale(): number {
    return this.layoutService.config().scale;
  }

  set scale(_val: number) {
    this.layoutService.config.update((config) => ({
      ...config,
      scale: _val,
    }));
  }

  get menuMode(): string {
    return this.layoutService.config().menuMode;
  }

  set menuMode(_val: string) {
    this.layoutService.config.update((config) => ({
      ...config,
      menuMode: _val,
    }));
  }

  get inputStyle(): string {
    return this.layoutService.config().inputStyle;
  }

  set inputStyle(_val: string) {
    this.layoutService.config().inputStyle = _val;
  }

  get ripple(): boolean {
    return this.layoutService.config().ripple;
  }

  onConfigButtonClick() {
    this.layoutService.showConfigSidebar();
  }
}

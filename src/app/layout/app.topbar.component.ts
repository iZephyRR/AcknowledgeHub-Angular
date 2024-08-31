import { Component, ElementRef, ViewChild, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { AppComponent } from '../app.component';
import { MenuService } from './app.menu.service';
import { ChangeDetectorRef } from '@angular/core';
import { NotificationService } from '../services/notifications/notification service';
import { UserService } from '../services/user/user.service';
import { User } from '../modules/user';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'

})
export class AppTopBarComponent implements OnInit {
  user: User;
  items!: MenuItem[];
  unreadCount: number = 0; // Unread notification count
  notifications: any[] = []; // Notifications array
  showNotifications: boolean = false; // Toggle for notification dropdown

  @ViewChild('menubutton') menuButton!: ElementRef;
  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
  @ViewChild('topbarmenu') menu!: ElementRef;

  @Input() minimal: boolean = false;

  scales: number[] = [12, 13, 14, 15, 16];

  visibleSidebar: boolean = false;

  isProfileCardVisible = false;

  showProfileCard() {
    this.isProfileCardVisible = !this.isProfileCardVisible;
  }

  closeProfileCard() {
    this.isProfileCardVisible = false;
}

  constructor(
    public layoutService: LayoutService,
    private userService: UserService,
    public menuService: MenuService,
    private notificationService: NotificationService, // Inject NotificationService
    private cd: ChangeDetectorRef, // Inject ChangeDetectorRef
    public authService:AuthService
  ) { }

  ngOnInit():void{
//     this.userService.getUserById().subscribe(data => {
//       this.user = data;
//     });

    this.profile();
    this.notificationService.loadNotifications();

    this.notificationService.unreadCount$.subscribe({
      next: (count) => {
        this.unreadCount = count;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Failed to fetch unread count:', err),
    });

    // Subscribe to notifications
    this.notificationService.notifications$.subscribe({
      next: (notifications) => {
        console.log('Fetched Notifications:', notifications);
        this.notifications = notifications.map((notification) => ({
          ...notification,
          message: `Announcement ${notification.announcementId} was sent on ${new Date(
            notification.noticeAt
          ).toLocaleDateString()}  "${notification.category}" by "${notification.SenderName}(${notification.Sender})"  Status: ${notification.status}, Type: ${notification.type}.`,
        }));
        this.cd.detectChanges();
      },
      error: (err) => console.error('Failed to fetch notifications:', err),
    });
  }

  profile() {
    this.userService.getUserById().subscribe(data => {
        this.user = data;
      });
  }

  toggleNotificationDropdown(): void {
    this.showNotifications = !this.showNotifications;
    this.cd.detectChanges();
  }

  profile(){
    this.userService.getUserById().subscribe(data => {
      console.log(data);
      this.user = data;
    });

  }

  markAsRead(notification: any): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id); // Mark notification as read in service
      notification.isRead = true; // Update notification status in the component
      this.unreadCount--; // Decrement unread count

      // Remove read notifications from the list to prevent them from reappearing
      this.notifications = this.notifications.filter(noti => noti.id !== notification.id);

      this.cd.detectChanges(); // Detect changes to update view
    }
  }


  markAllAsRead(): void {
    // Call service method to mark all notifications as read
    this.notificationService.markAllAsRead();

    // Reset unread count and local notifications after marking all as read
    this.unreadCount = 0;

    // Update the component's notifications state
    this.notifications = this.notifications.map(notification => ({
      ...notification,
      isRead: true
    }));

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

  // logOut() {
  //   this.authService.logOut();
  // }
  
}

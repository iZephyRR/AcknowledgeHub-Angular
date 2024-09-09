import { Component, ElementRef, ViewChild, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { AppComponent } from '../app.component';
import { MenuService } from './app.menu.service';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { User } from '../modules/user';
import { AuthService } from '../services/auth/auth.service';
import { MessageDemoService } from '../services/message/message.service';
import { map } from 'rxjs/operators';
import { NotificationService } from '../services/notifications/notification service';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit {
  user: User;
  items!: MenuItem[];
  unreadCount: number = 0; // Unread notification count
  notifications: any[] = []; // General notifications
  notedNotifications: any[] = []; // Noted notifications
  combinedNotifications: any[] = []; // Combined list for rendering
  showNotifications: boolean = false; // Toggle for notification dropdown

  @ViewChild('menubutton') menuButton!: ElementRef;
  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
  @ViewChild('topbarmenu') menu!: ElementRef;

  @Input() minimal: boolean = false;

  visibleSidebar: boolean = false;
  isProfileCardVisible = false;
 isChangePasswordModalVisible: boolean = false;

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  currentPasswordError: string = '';
  newPasswordError: string = '';
  confirmPasswordError: string = '';


  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  constructor(
    public layoutService: LayoutService,
    private userService: UserService,
    public menuService: MenuService,
    private notificationService: NotificationService,
    public messageService: MessageDemoService,
    private cd: ChangeDetectorRef,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    // Load profile and notifications on init
    this.profile();
    this.loadNotifications();
    this.loadNotedNotifications();
  }

  // Fetch user profile
  profile(): void {
    this.userService.getUserById().subscribe(data => {
      this.user = data;
    });
  }

  // Load general notifications
  loadNotifications(): void {
    this.notificationService.notifications$.subscribe({
      next: (notifications) => {
        this.notifications = notifications.map(notification => ({
          ...notification,
          message: `Announcement ${notification.announcementId} was sent on ${new Date(notification.noticeAt).toLocaleDateString()} "${notification.category}" by "${notification.SenderName}(${notification.Sender})"`,
        }));
        this.updateCombinedNotifications();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Failed to fetch notifications:', err),
    });
  }

  // Load noted notifications
  loadNotedNotifications(): void {
    this.notificationService.notifications$.pipe(
      map(notifications => notifications.filter(notification => notification.noticeAt !== notification.timestamp))
    ).subscribe({
      next: (notedNotifications) => {
        console.log('Fetched Noted Notifications:', notedNotifications);

        this.notedNotifications = notedNotifications.map(notification => {
          const acknowledgedUsers = notification.acknowledgedUsers || [];
          console.log('Acknowledged Users:', acknowledgedUsers); // Debug

          let message: string;

          if (Array.isArray(acknowledgedUsers)) {
            if (acknowledgedUsers.length > 1) {
              message = `${acknowledgedUsers[0]} and ${acknowledgedUsers.length - 1} others have noted the announcement.`;
            } else if (acknowledgedUsers.length === 1) {
              message = `${acknowledgedUsers[0]} has noted the announcement.`;
            } else {
              // Handle case where there are no acknowledged users
              message = 'No users have noted this announcement.';
            }
          } else {
            console.warn('acknowledgedUsers is not an array or is missing:', acknowledgedUsers);
            message = 'Data format issue: acknowledgedUsers is not an array.';
          }

          return { ...notification, message };
        }).filter(n => n !== null); // Filter out null messages

        console.log('Noted Notifications with Messages:', this.notedNotifications);

        this.updateCombinedNotifications();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Failed to fetch noted notifications:', err),
    });
  }



  // Update combined notifications and unread count
  updateCombinedNotifications(): void {
    this.combinedNotifications = [...this.notifications, ...this.notedNotifications];
    this.unreadCount = this.combinedNotifications.filter(notification => !notification.isRead).length;

    console.log('Combined Notifications:', this.combinedNotifications);
    console.log('Unread Count:', this.unreadCount);
  }

  // Toggle notification dropdown
  toggleNotificationDropdown(): void {
    this.showNotifications = !this.showNotifications;
  }

  // Mark individual notification as read
  markAsRead(notification: any): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id);
      notification.isRead = true;
      this.unreadCount--;
      this.cd.detectChanges(); // Ensure the view is updated
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
    this.unreadCount = 0;
    this.combinedNotifications.forEach(notification => notification.isRead = true);
    this.cd.detectChanges();
  }

  // Show or hide the profile card
  showProfileCard(): void {
    this.isProfileCardVisible = !this.isProfileCardVisible;
  }

  closeProfileCard(): void {
    this.isProfileCardVisible = false;
  }

    
  changePassword() {
    this.isChangePasswordModalVisible = true;
  }
  onSave() {
    // Reset all error messages
    this.currentPasswordError = '';
    this.newPasswordError = '';
    this.confirmPasswordError = '';

    // Validate current password
    if (!this.currentPassword) {
      this.currentPasswordError = 'Current password is required.';
    }

    // Validate new password
    if (!this.newPassword) {
      this.newPasswordError = 'New password is required.';
    } else if (this.currentPassword === this.newPassword) {
      this.newPasswordError = 'The new password cannot be the same as the current password.';
    }

    // Validate confirm password
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Confirm password is required.';
    } else if (this.newPassword !== this.confirmPassword) {
      this.confirmPasswordError = 'The new password and confirm password must match.';
    }

    // If any error exists, return early
    if (this.currentPasswordError || this.newPasswordError || this.confirmPasswordError) {
      return;
    }

    // Proceed with password change after validations
    this.authService.validateCurrentPassword(this.currentPassword).subscribe({
      next: (data) => {
        if (data.boolean_RESPONSE) {
          this.authService.changePassword2(this.newPassword).subscribe({
            next: () => {
              console.log('Password changed successfully!');
              this.isChangePasswordModalVisible = false;
            },
            error: (err) => {
              console.error('Failed to update password:', err);
              this.newPasswordError = 'Failed to update password. Please try again.';
            }
          });
        } else {
          this.currentPasswordError = 'The current password is incorrect. Please try again.';
        }
      },
      error: (err) => {
        console.error('Current password validation failed:', err);
        this.currentPasswordError = 'Current password validation failed.';
      }
    });
  }
  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'confirm') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
 

  onCancel() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    // this.passwordsMatch = true;
    // this.newPasswordError = false;
    // this.passwordValidationError = '';
    this.isChangePasswordModalVisible = false;
  }

    
  // Getters and setters for layout settings
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
    this.layoutService.config.update((config) => ({ ...config, scale: _val }));
  }

  get menuMode(): string {
    return this.layoutService.config().menuMode;
  }

  set menuMode(_val: string) {
    this.layoutService.config.update((config) => ({ ...config, menuMode: _val }));
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

  onConfigButtonClick(): void {
    this.layoutService.showConfigSidebar();
  }
}

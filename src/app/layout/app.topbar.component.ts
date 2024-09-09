import { Component, ElementRef, ViewChild, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { MenuService } from './app.menu.service';
import { UserService } from '../services/user/user.service';
import { User } from '../modules/user';
import { AuthService } from '../services/auth/auth.service';
import { NotificationService } from '../services/notifications/notification service';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit {
  user: User;
  items!: MenuItem[];
  unreadCount: number = 0;
  notifications: any[] = [];
  showNotifications: boolean = false;

  @ViewChild('menubutton') menuButton!: ElementRef;
  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
  @ViewChild('topbarmenu') menu!: ElementRef;

  @Input() minimal: boolean = false;

  scales: number[] = [12, 13, 14, 15, 16];
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
    private cd: ChangeDetectorRef,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.profile();
    this.notificationService.loadNotifications();

    this.notificationService.unreadCount$.subscribe({
      next: (count) => {
        this.unreadCount = count;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Failed to fetch unread count:', err),
    });

    this.notificationService.notifications$.subscribe({
      next: (notifications) => {
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

  markAsRead(notification: any): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id);
      notification.isRead = true;
      this.unreadCount--;
      this.notifications = this.notifications.filter(noti => noti.id !== notification.id);
      this.cd.detectChanges();
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
    this.unreadCount = 0;
    this.notifications = this.notifications.map(notification => ({
      ...notification,
      isRead: true
    }));
    this.showNotifications = false;
    this.cd.detectChanges();
  }

  showProfileCard() {
    this.isProfileCardVisible = !this.isProfileCardVisible;
  }

  closeProfileCard() {
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

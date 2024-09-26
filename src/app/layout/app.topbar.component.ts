import { Component, ElementRef, ViewChild, Input, OnInit, HostListener, Renderer2 } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { AppComponent } from '../app.component';
import { MenuService } from './app.menu.service';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { User, UserProfile } from '../modules/user';
import { AuthService } from '../services/auth/auth.service';
import { MessageDemoService } from '../services/message/message.service';
import { catchError, filter, map } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from, fromEvent, Observable, of, Subscription, throwError } from 'rxjs';
import { SystemService } from '../services/system/system.service';
import { NotificationService } from '../services/notifications/notification service';
import { Notification } from '../modules/notification.model';
@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit {
  user: UserProfile = {} as UserProfile;
  items!: MenuItem[];
  unreadCount: number = 0;
  unreadChatCount: number = 0;

  // Unread notification count
  notifications: Notification[] = []; // General notifications
  notedNotifications: Notification[] = []; // Noted notifications
  commentNotifications: Notification[] = [];
  replyNotifications: Notification[] = [];
  combinedNotifications: Notification[] = []; // Combined list for rendering
  showNotifications: boolean = false;
  showChatNotifications: boolean = false;// Toggle for notification dropdown
  profileImage: SafeUrl | null = null;
  clickOutsideSubscription!: Subscription; // Subscription for click events

  @ViewChild('menubutton') menuButton!: ElementRef;
  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
  @ViewChild('topbarmenu') menu!: ElementRef;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('notificationDropdown') notificationDropdown!: ElementRef;
  @ViewChild('notificationIcon') notificationIcon!: ElementRef;
  @ViewChild('profileDropdown') profileDropdown!: ElementRef;
  @Input() minimal: boolean = false;
  @Input() announcementId: number;
  @Input() day: number = 1;

  visibleNotifications: Notification[] = []; // Only the visible notifications
  pageSize: number = 5; // Number of notifications to load per "See more"
  currentPage: number = 0; // Track the current page
  canLoadMore: boolean = false;
  loading: boolean = false; // Loading state
  private clickListener: () => void;
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
  selectedFile: File | null = null;

  constructor(
    public layoutService: LayoutService,
    public userService: UserService,
    public menuService: MenuService,
    private notificationService: NotificationService,
    public messageService: MessageDemoService,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    public authService: AuthService,
    private firestore: AngularFirestore,
    public systemService: SystemService, private renderer: Renderer2, private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.loadChatNotificationsFromLocalStorage();
    this.profile();
    //this.loadNotifications();
    this.notificationService.loadNotifications();
    this.loadNotedNotifications();
    this.loadNotificationsForComment();
    this.loadReplyNotificationsForComment();
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
      this.updateCombinedNotifications();
    });
  }

  profile(): void {
    this.userService.getProfileInfo().subscribe({
      next: (data) => {
        console.log(data);
        this.user = data;
        this.userService.profileImage = this.user.photoLink ? `data:image/png;base64,${this.user.photoLink}` : undefined;
        this.userService.companyName = this.user.companyName;
      },
      error: (err) => {
        console.error('Profile error ' + err);
      }
    }

    );
  }

  // Load general notifications
  loadNotifications(): void {
    this.notificationService.notifications$.subscribe({
      next: (notifications: Notification[]) => {
        this.notifications = notifications.map(notification => ({
          ...notification,
          announcementId: notification.announcementId,
          message: notification.SenderName && notification.Sender ?
            `${notification.SenderName} (${notification.Sender}) posted an announcement "${notification.title}" on ${new Date(notification.noticeAt).toLocaleDateString()}` :
            `Announcement posted on ${new Date(notification.noticeAt).toLocaleDateString()}`
        })).sort((a, b) => new Date(b.noticeAt).getTime() - new Date(a.noticeAt).getTime());

        console.log('Processed Notifications:', this.notifications);
        this.updateCombinedNotifications();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Failed to fetch notifications:', err),
    });
  }

  loadNotificationsForComment(): void {
    console.log("Attempting to load comment notifications...");
    this.notificationService.loadCommentsNotifications().subscribe(
      (commentNotifications: Notification[]) => {
        console.log("Comment notifications fetched successfully:", commentNotifications); // Check here
        this.commentNotifications = commentNotifications;
        this.unreadChatCount = this.commentNotifications.filter(notification => !notification.isRead).length;
        if (this.commentNotifications.length > 0) {
          console.log('First comment message:', this.commentNotifications[0].message);
        }
        this.updateCombinedNotifications();
      },
      (error) => {
        console.error('Error loading comment notifications:', error); // Ensure you see this log in case of an error
      }
    );
  }

  loadReplyNotificationsForComment(): void {
    console.log("Attempting to load replies notifications...");
    this.notificationService.loadReplyCommentsNotifications().subscribe(
      (replyNotifications: Notification[]) => {
        console.log("Reply replies notifications fetched successfully:", replyNotifications); // Check here

        this.replyNotifications = replyNotifications;
        this.unreadChatCount = this.replyNotifications.filter(notification => !notification.isRead).length;

        if (this.replyNotifications.length > 0) {
          console.log('First reply notification message:', this.replyNotifications[0].message);
        } else {
          console.log('No reply notifications available.');
        }

        this.updateCombinedNotifications();
      },
      (error) => {
        console.error('Error loading reply comment notifications:', error); // Ensure you see this log in case of an error
      }
    );
  }

  fetchAnnouncementId(userId: string): Observable<string> {
    return from(
      this.firestore.collection('notifications')
        .ref
        .where('userId', '==', +userId)
        .orderBy('announcementId', 'desc')
        .orderBy('noticeAt', 'desc')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get()
        .then(snapshot => {
          if (snapshot.empty) {
            throw new Error('No announcements found for user.');
          }
          const announcement = snapshot.docs[0].data();
          return announcement['announcementId'] as string;
        })
    ).pipe(
      catchError(err => {
        console.error('Error fetching announcement ID:', err);
        return throwError(() => new Error('Failed to fetch announcement ID.'));
      })
    );
  }

  loadNotedNotifications(): void {
    this.notificationService.getNotedNotifications()
      .subscribe(
        (notedNotifications: Notification[]) => {
          this.notedNotifications = notedNotifications;

          console.log('Noted Notifications:', this.notedNotifications);

          if (this.notedNotifications.length > 0) {
            console.log('First noted message:', this.notedNotifications[0].message);
          }

          this.updateCombinedNotifications();
        },
        (error) => {
          console.error('Error loading noted notifications:', error);
        }
      );
  }


  updateCombinedNotifications(): void {
    this.combinedNotifications = [...this.notifications, ...this.notedNotifications, ...this.commentNotifications, ...this.replyNotifications]
      .sort((a, b) => new Date(b.noticeAt).getTime() - new Date(a.noticeAt).getTime());
    this.unreadCount = this.combinedNotifications.filter(notification => !notification.isRead).length;
    this.loadNotificationsFromLocalStorage();
    this.loadInitialVisibleNotifications(); // Load the initial set of visible notifications
  }


  saveNotificationsToLocalStorage(): void {
    const readNotifications = this.combinedNotifications.map(notification => ({
      id: notification.id,
      isRead: notification.isRead
    }));
    localStorage.setItem('notifications', JSON.stringify(readNotifications));
  }


  loadNotificationsFromLocalStorage(): void {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const readStatusList = JSON.parse(savedNotifications);
      this.combinedNotifications.forEach(notification => {
        const readStatus = readStatusList.find((n: any) => n.id === notification.id);
        if (readStatus) {
          notification.isRead = readStatus.isRead;
        }
      });

      this.unreadCount = this.combinedNotifications.filter(notification => !notification.isRead).length;
    }
  }

  // Toggle notification dropdown
  toggleNotificationDropdown(): void {
    this.showNotifications = !this.showNotifications;

    if (this.showNotifications) {
      // Register the outside click listener when dropdown is shown
      this.clickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (
          this.notificationDropdown &&
          this.notificationIcon &&
          !this.notificationDropdown.nativeElement.contains(target) &&
          !this.notificationIcon.nativeElement.contains(target)
        ) {
          this.showNotifications = false; // Close the dropdown
          this.removeClickListener(); // Remove the listener to avoid unnecessary listeners
        }
      });
    } else {
      this.removeClickListener();
    }
  }

  ngOnDestroy(): void {
    this.removeClickListener();
  }

  private removeClickListener(): void {
    if (this.clickListener) {
      this.clickListener();
      this.clickListener = null;
    }
  }

  toggleChatDropdown(): void {
    this.showChatNotifications = !this.showChatNotifications;
    this.isProfileCardVisible = false; // Close profile when opening notifications
  }


  closeDropdowns(event: MouseEvent): void {
    const clickedInsideNotification = this.notificationDropdown?.nativeElement.contains(event.target);
    const clickedInsideProfile = this.profileDropdown?.nativeElement.contains(event.target);

    if (!clickedInsideNotification) {
      this.showNotifications = false;
    }

    if (!clickedInsideProfile) {
      this.isProfileCardVisible = false;
    }
  }

  addOutsideClickListener(): void {
    fromEvent(document, 'click')
      .pipe(filter(() => this.showNotifications || this.isProfileCardVisible)) // Only listen if dropdowns are open
      .subscribe((event: MouseEvent) => this.closeDropdowns(event));
  }

  removeOutsideClickListener(): void {
    // Make sure to clean up the listener
    fromEvent(document, 'click').subscribe().unsubscribe();
  }


  // Mark individual notification as read
  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      notification.isRead = true;
      this.unreadCount--;
      this.saveNotificationsToLocalStorage();
      this.cd.detectChanges();
    }
  }

  markAllAsRead(): void {
    this.combinedNotifications.forEach(notification => notification.isRead = true);
    this.unreadCount = 0;
    this.saveNotificationsToLocalStorage();
    this.cd.detectChanges();
    this.showNotifications = false;
  }

  // Show or hide the profile card
  showProfileCard(): void {
    this.isProfileCardVisible = !this.isProfileCardVisible;
    this.showNotifications = false; // Close notifications when opening profile
  }

  closeProfileCard(): void {
    this.isProfileCardVisible = false;
  }

  @HostListener('document:click', ['$event'])
  handleProfileClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if the click is outside the profile card
    const profileCard = document.querySelector('.profile-sidebar-card');
    const profileButton = document.querySelector('.layout-config-button');

    if (this.isProfileCardVisible &&
      !profileCard?.contains(target) &&
      !profileButton?.contains(target)) {
      this.isProfileCardVisible = false; // Close the card
    }
  }

  onChangeProfile(): void {

    if (this.fileInput) {
      console.log(this.fileInput); // Debugging: ensure it's defined
      this.fileInput.nativeElement.click();
    } else {
      console.error('File input element is not available.');
    }
  }

  async onFileSelected(event: Event) {
    if ((await this.messageService.confirmed('Change profile', 'Are you sure to change your profile photo?', 'Yes', 'No', 'WHITE', 'BLUE')).confirmed) {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        this.selectedFile = input.files[0];
        // Preview the selected image
        const objectURL = URL.createObjectURL(this.selectedFile);
        this.profileImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        this.uploadProfileImage();
      }
    }

  }

  uploadProfileImage() {
    console.log("in upload profile image");
    if (this.selectedFile) {
      this.userService.uploadProfileImage(this.selectedFile).subscribe({
        next: (response) => {
          this.profile();
          this.messageService.toast("success", "Upload Profile Successful");

        },
        error: (error) => {
          this.messageService.toast("error", "Upload Failed");
        }
      });
    }
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
        if (data.BOOLEAN_RESPONSE) {
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

  loadMoreNotifications(): void {
    if (this.loading) return; // Prevent multiple clicks while loading

    this.loading = true;

    // Simulate an async loading delay (e.g., fetching from the server)
    setTimeout(() => {
      this.currentPage++;

      // Get the next set of notifications
      const newNotifications = this.combinedNotifications.slice(
        this.visibleNotifications.length,
        this.pageSize * this.currentPage
      );

      // Add new notifications to the visible list
      this.visibleNotifications = [...this.visibleNotifications, ...newNotifications];

      // Check if we can load more
      this.checkCanLoadMore();

      this.loading = false; // Reset loading state
      this.cd.detectChanges();
    }, 1500); // Simulate 1.5 seconds delay
  }


  checkCanLoadMore(): void {
    // Check if there are more notifications to load than what's currently visible
    this.canLoadMore = this.visibleNotifications.length < this.combinedNotifications.length;
  }



  loadInitialVisibleNotifications(): void {
    this.currentPage = 1; // First page
    this.visibleNotifications = this.combinedNotifications.slice(0, this.pageSize);
    this.checkCanLoadMore(); // Check if there are more notifications to load
  }

  markAsReadChat(notification: Notification): void {
    if (!notification.isRead) {
      notification.isRead = true;
      this.unreadChatCount--;
      this.saveChatNotificationsToLocalStorage();
      this.cd.detectChanges();
    }
  }

  markAllAsReadChat(): void {
    this.commentNotifications.forEach(notification => notification.isRead = true);
    this.unreadChatCount = 0;
    this.saveChatNotificationsToLocalStorage();
    this.cd.detectChanges();
    this.showChatNotifications = false;
  }

  saveChatNotificationsToLocalStorage(): void {
    const readChatNotifications = this.commentNotifications.map(notification => ({
      id: notification.id,
      isRead: notification.isRead
    }));
    localStorage.setItem('chatNotifications', JSON.stringify(readChatNotifications));
  }

  loadChatNotificationsFromLocalStorage(): void {
    const savedChatNotifications = localStorage.getItem('chatNotifications');
    if (savedChatNotifications) {
      const readChatStatusList = JSON.parse(savedChatNotifications);
      this.commentNotifications.forEach(notification => {
        const readStatus = readChatStatusList.find((n: any) => n.id === notification.id);
        if (readStatus) {
          notification.isRead = readStatus.isRead;
        }
      });
      this.unreadChatCount = this.commentNotifications.filter(notification => !notification.isRead).length;
    }
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

import { Message } from 'primeng/api';
import { ChangeDetectorRef, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AuthService } from '../auth/auth.service';
import { catchError, map, take } from 'rxjs/operators';
import { Notification } from 'src/app/modules/notification.model';

@Injectable({
  providedIn: 'root',
})

export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private notedNotificationsSubject = new BehaviorSubject<any[]>([]);
  notedNotifications$ = this.notedNotificationsSubject.asObservable();

  private notedNotifications: any[] = [];
  private notifications: any[] = [];

  private combinedNotifications: any[] = [];

  private apiUrl = 'http://localhost:8080/api/v1/notifications';   private notificationsCollection: AngularFirestoreCollection<any>;

  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore,
    private authService: AuthService,

  ) {
    this.notificationsCollection = this.firestore.collection('notifications');
    this.loadNotifications();

  }


  private saveReadStatusToLocalStorage(): void {
    const readNotificationIds = this.notifications
      .filter(n => n.isRead)
      .map(n => n.id);
    localStorage.setItem('readNotifications', JSON.stringify(readNotificationIds));
  }


  private loadReadStatusFromLocalStorage(): void {
    const readNotificationIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    this.notifications.forEach(notification => {
      if (readNotificationIds.includes(notification.id)) {
        notification.isRead = true;
      }
    });
  }

  updateCombinedNotifications(): void {

    this.combinedNotifications = [...this.notifications, ...this.notedNotifications];
    this.combinedNotifications.sort((a, b) => {
      const timeA = new Date(a.noticeAt || a.timestamp).getTime();
      const timeB = new Date(b.noticeAt || b.timestamp).getTime();
      return timeB - timeA;
    });

    const unreadCount = this.combinedNotifications.filter(notification => !notification.isRead).length;
    this.unreadCountSubject.next(unreadCount);
    this.notificationsSubject.next(this.combinedNotifications);
  }

  loadNotifications(): void {
    const userId = this.authService.userId;

    if (userId) {
      console.log('Querying notifications for userId:', userId);
      this.firestore.collection('notifications', ref =>
        ref.where('targetId', '==', userId)
          .orderBy('userId', 'asc')
          .orderBy('announcementId', 'desc')
          .orderBy('timestamp', 'desc')
          .orderBy('noticeAt', 'desc')
          .orderBy('__name__', 'desc')
      ).valueChanges({ idField: 'id' }).pipe(
        catchError(error => {
          console.error('Error fetching notifications:', error);
          return of([]);
        }),
        map((notifications: any[]) => notifications.map(notification => {
          const senderName = notification.SenderName || 'Unknown Sender';
          const title = notification.title || 'No Title';
          const timestamp = notification.noticeAt ? new Date(notification.noticeAt).toLocaleDateString() : 'Unknown Date';
          return {
            ...notification,
            message: `${senderName} posted an announcement "${title}" on ${timestamp}`
          };
        }))
      ).subscribe(
        (notifications: any[]) => {
          console.log('Processed Notifications:', notifications);
          this.notifications = notifications;
          this.updateCombinedNotifications();
        }
      );
    } else {
      console.warn('User ID is undefined. Cannot load notifications.');
    }
  }


  markAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.getValue();
    const notification = notifications.find(n => n.id === notificationId);

    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.notificationsSubject.next(notifications);
      this.unreadCountSubject.next(this.unreadCountSubject.value - 1);
      this.updateCombinedNotifications();
      this.saveReadStatusToLocalStorage();
    }
  }
//   markAsReadForNoted(notificationId: string): void {
//     // Get the current noted notifications from the BehaviorSubject
//     const notedNotifications = this.notedNotificationsSubject.getValue();
//     const notification = notedNotifications.find(n => n.id === notificationId);

//     if (notification && !notification.isRead) {
//       // Mark the noted notification as read locally
//       notification.isRead = true;
//       // Update the BehaviorSubject with the new state
//       this.notedNotificationsSubject.next(notedNotifications);
//       // Decrement unread count
//       const unreadCount = notedNotifications.filter(n => !n.isRead).length;
//       this.unreadCountSubject.next(unreadCount);
//       // Update the combined notifications to reflect the changes
//       this.updateCombinedNotifications();
//     }
//   }


  markAllAsRead(): void {
    this.notifications.forEach(notification => notification.isRead = true);
    this.notedNotifications.forEach(notification => notification.isRead = true);

    this.unreadCountSubject.next(0);
    this.updateCombinedNotifications();
    this.saveReadStatusToLocalStorage();
  }


  addNotification(notification: any, recipientUserIds: string[]): void {
    console.log('addNotification method called');
    const currentNotifications = this.notificationsSubject.value;

    if (!notification.title || notification.title === 'null') {
      console.error('Notification title is null or undefined.');
      return;
    }

    console.log('Notification Title:', notification.title);

    const recipientUserIdsSet = new Set(recipientUserIds);

    recipientUserIdsSet.forEach(userId => {
      const userNotification = { ...notification, targetId: userId };

      if (!userNotification.message || userNotification.message === 'null') {
        console.warn('Skipping notification with null message for user:', userId);
        return;
      }
      const existingNotification = currentNotifications.find(n =>
        n.targetId === userId && n.announcementId === notification.announcementId
      );

      if (!existingNotification) {
        console.log('Adding notification for user:', userId);
        this.firestore.collection('notifications').add(userNotification)
          .then(() => {
            console.log('Notification added to Firestore for user:', userId);
            this.notificationsSubject.next([userNotification, ...currentNotifications]);
            this.incrementUnreadCount();
          })
          .catch(error => console.error('Error adding notification for user:', userId, error));
      } else {
        console.log('Skipping duplicate notification for user:', userId);
      }
    });
    const creatorNotification = { ...notification, targetId: this.authService.userId };

    if (!creatorNotification.message || creatorNotification.message === 'null') {
      console.warn('Skipping creator notification with null message');
      return;
    }
    const existingCreatorNotification = currentNotifications.find(n =>
      n.targetId === creatorNotification.targetId && n.announcementId === creatorNotification.announcementId
    );

    if (!existingCreatorNotification) {
      console.log('Adding notification for creator:', creatorNotification.targetId);
      this.firestore.collection('notifications').add(creatorNotification)
        .then(() => {
          console.log('Notification added for creator:', creatorNotification.targetId);
          this.notificationsSubject.next([creatorNotification, ...currentNotifications]);
          this.incrementUnreadCount();
        })
        .catch(error => console.error('Error adding notification for creator:', creatorNotification.targetId, error));
    } else {
      console.log('Creator notification already exists:', creatorNotification.targetId);
    }
  }

  incrementUnreadCount(): void {
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
  }

  resetUnreadCount(): void {
    this.unreadCountSubject.next(0);
  }


  sendNotification(notificationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, notificationData).pipe(
      catchError(error => {
        console.error('Error sending notification:', error);
        return of(null);
      })
    );
  }

  getNotedNotifications(): Observable<Notification[]> {
    const userId = this.authService.userId;

    if (userId) {
      console.log('Querying noted notifications for userId:', userId);

      const numericUserId = Number(userId);

      return this.firestore.collection('noted', ref =>
        ref.where('targetId', '==', numericUserId)
          .orderBy('noticeAt', 'desc')
      ).valueChanges({ idField: 'id' }).pipe(
        catchError(error => {
          console.error('Error fetching notedNotifications:', error);
          return of([]);
        }),
        map((notedNotifications: any[]) => notedNotifications.map(notification => {
          const message = notification.message || 'Unknown message';

          return {
            ...notification,
            message: message
          } as Notification;
        }))
      );
    }

    return of([]);  
  }

}
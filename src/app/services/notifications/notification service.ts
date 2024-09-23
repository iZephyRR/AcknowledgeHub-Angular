import { Comment } from './../../modules/comment';
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

  private commentNotificationSubject = new BehaviorSubject<Notification[]>([]);
  commentNotification$ = this.commentNotificationSubject.asObservable();

  private replyNotificationSubject = new BehaviorSubject<Notification[]>([]);
  replyNotification$ = this.replyNotificationSubject.asObservable();


  private notedNotifications: any[] = [];
  private notifications: any[] = [];
  private commentNotifications: any[] = [];
  private replyNotifications: any[] = []

  private combinedNotifications: any[] = [];

  private apiUrl = 'http://localhost:8080/api/v1/notifications'; private notificationsCollection: AngularFirestoreCollection<any>;

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

    this.combinedNotifications = [...this.notifications, ...this.notedNotifications, ...this.commentNotifications];
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

      const userIdString = String(userId);

      console.log('Querying notifications for userId:', userIdString);

      this.firestore.collection('notifications', ref =>
        ref.where('targetId', '==', userIdString)
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
        map((notifications: any[]) => {
          notifications.forEach(notification => {
            console.log('Notification userId:', notification.userId);
            console.log('Notification SenderId:', notification.SenderID);
          });

          return notifications.filter(notification => {
            const senderIdString = String(notification.SenderID);
            const isSender = senderIdString === userIdString;
            console.log(`Comparing SenderId: ${senderIdString} with userId: ${userIdString}, isSender: ${isSender}`);
            return !isSender;
          }).map(notification => {
            const senderName = notification.SenderName || 'Unknown Sender';
            const title = notification.title || 'No Title';
            const timestamp = notification.noticeAt ? new Date(notification.noticeAt).toLocaleDateString() : 'Unknown Date';

            return {
              ...notification,
              message: `${senderName} posted an announcement "${title}" on ${timestamp}`
            };
          });
        })
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

  loadCommentsNotifications(): Observable<Notification[]> {
    const userId = this.authService.userId; // Get the current user ID

    if (userId) {
      console.log('Querying comment notifications_for_comment for userId (targetId):', userId);
      // Log to confirm type

      // Ensure userId is a string for comparison with targetId
      const userIdString = String(userId);

      return this.firestore.collection('notifications_for_comment', ref =>
        ref.where('targetId', '==', userIdString) // Ensure comparison is done with string type
          .orderBy('noticeAt', 'desc') // Fetch notifications sent to the current user
      ).valueChanges({ idField: 'id' }).pipe(
        catchError(error => {
          console.error('Error fetching notifications:', error);
          return of([]); // Return an empty array in case of error
        }),
        map((commentNotifications: any[]) => commentNotifications.map(notification => {
          const message = notification.message || 'Unknown message';
          return {
            ...notification,
            message: message
          } as Notification;
        }))
      );
    }

    console.warn('User ID is undefined. Cannot load comment notifications.');
    return of([]);
  }


  loadReplyCommentsNotifications(): Observable<Notification[]> {
    const userId = this.authService.userId; // Get the current user ID

    if (userId) {
      console.log('Querying comment replies for userId (commentId):', userId);

      // Cast userId as a string, but check if it needs to be a number
      const userIdString = String(userId); // Assuming 'commentId' is stored as a string in Firestore
      console.log('Type of userId:', typeof userId); // Log to confirm type

      return this.firestore.collection('replies', ref =>
        ref.where('commentId', '==', userIdString) // Ensure comparison is done with string type

      ).valueChanges({ idField: 'id' }).pipe(
        catchError(error => {
          console.error('Error fetching reply notifications:', error);
          return of([]); // Return an empty array in case of error
        }),
        map((replyNotifications: any[]) => {
          if (!replyNotifications.length) {
            console.log('No reply notifications found for userId:', userIdString);
          } else {
            console.log('Reply notifications found:', replyNotifications);
          }
          return replyNotifications.map(notification => {
            const message = notification.message || 'Unknown message';
            return {
              ...notification,
              message: message
            } as Notification;
          });
        })
      );
    }

    console.warn('User ID is undefined. Cannot load comment notifications.');
    return of([]); // Return empty array if userId is undefined
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

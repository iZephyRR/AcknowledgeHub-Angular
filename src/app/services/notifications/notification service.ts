import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../auth/auth.service';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private apiUrl = 'http://localhost:8080/api/v1/notifications';

  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const senderRole = this.authService.role; // Get the role as the sender

    if (senderRole) {
      // Trim the role to remove any leading or trailing spaces
      const trimmedSender = senderRole.trim();

      console.log('Querying notifications for Sender:', trimmedSender);

      this.firestore.collection('notifications', ref =>
        ref.where('Sender', '==', trimmedSender)
           .orderBy('noticeAt', 'desc')
           .orderBy('sentTo', 'asc')
      ).valueChanges({ idField: 'id' }).pipe(
        catchError(error => {
          if (error.message.includes('The query requires an index')) {
            console.error('Index error: You need to create an index to run this query.');
          } else {
            console.error('Error fetching notifications:', error);
          }
          return []; // Return an empty array on error
        })
      ).subscribe(
        (notifications: any[]) => {
          console.log('Fetched Notifications:', notifications);
          if (notifications.length > 0) {
            const unreadNotifications = notifications.filter(notification => !notification.isRead);
            this.notificationsSubject.next(notifications);
            this.unreadCountSubject.next(unreadNotifications.length);
          } else {
            console.log('No notifications found for this user.');
          }
        }
      );
    } else {
      console.warn('Sender is undefined. Cannot load notifications.');
    }
  }

  markAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.getValue();
    const userId = this.authService.userId;

    // Ensure the notification belongs to the logged-in user
    const notification = notifications.find(n => n.id === notificationId && n.userId === userId);

    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.notificationsSubject.next(notifications);

      // Update the notification in Firestore
      this.firestore.collection('notifications').doc(notificationId).update({ isRead: true }).catch(error => {
        console.error('Error marking notification as read:', error);
      });

      this.unreadCountSubject.next(this.unreadCountSubject.value - 1);
    }
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.getValue();
    const userId = this.authService.userId;

    // Filter notifications that belong to the logged-in user and are unread
    const unreadNotifications = notifications.filter(
      n => !n.isRead && n.userId === userId
    );

    if (unreadNotifications.length > 0) {
      const batch = this.firestore.firestore.batch();
      unreadNotifications.forEach(notification => {
        notification.isRead = true;
        const notificationRef = this.firestore.collection('notifications').doc(notification.id).ref;
        batch.update(notificationRef, { isRead: true });
      });

      batch.commit().then(() => {
        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(0);
        this.http.post(`${this.apiUrl}/mark-all-read`, { userId }).subscribe();
      }).catch(error => {
        console.error('Error updating notifications:', error);
      });
    }
  }

  addNotification(notification: any, recipientUserIds: string[]): void {
    console.log('addNotification method called');
    const currentNotifications = this.notificationsSubject.value;

    // Ensure the title and other fields are properly set
    if (!notification.title || notification.title === 'null') {
        console.error('Notification title is null or undefined.');
        return; // Prevent adding a notification with a null title
    }

    console.log('Notification Title:', notification.title);

    // Use a set to avoid duplicate IDs for recipients
    const recipientUserIdsSet = new Set(recipientUserIds);

    // Loop through the recipients and create notifications for each
    recipientUserIdsSet.forEach(userId => {
        // Skip sending the same notification to the creator if the creator's ID is in the recipient list
        if (userId === this.authService.userId) {
            return;
        }

        const userNotification = { ...notification, userId };

        // Ensure the notification message is not null
        if (!userNotification.message || userNotification.message === 'null') {
            console.warn('Skipping notification with null message for user:', userId);
            return; // Skip adding a notification with a null message
        }

        const existingNotification = currentNotifications.find(n =>
            n.userId === userId && n.announcementId === notification.announcementId
        );

        if (!existingNotification) {
            this.notificationsSubject.next([userNotification, ...currentNotifications]);
            this.incrementUnreadCount();
            this.firestore.collection('notifications').add(userNotification);
        } else {
            console.log('Skipping duplicate notification for user:', userId);
        }
    });

    // Now add the notification for the creator themselves, but only for the creator's specific notification
    const creatorNotification = { ...notification, userId: this.authService.userId };

    if (!creatorNotification.message || creatorNotification.message === 'null') {
        console.warn('Skipping creator notification with null message');
        return; // Skip adding a creator notification with a null message
    }

    const existingCreatorNotification = currentNotifications.find(n =>
        n.userId === creatorNotification.userId && n.announcementId === creatorNotification.announcementId
    );

    if (!existingCreatorNotification) {
        this.notificationsSubject.next([creatorNotification, ...currentNotifications]);
        this.firestore.collection('notifications').add(creatorNotification);
        console.log('Notification added for creator:', creatorNotification);
    } else {
        console.log('Creator notification already exists:', creatorNotification);
    }
}


  incrementUnreadCount(): void {
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
  }

  resetUnreadCount(): void {
    this.unreadCountSubject.next(0);
  }

  sendNotification(notificationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, notificationData);
  }
}

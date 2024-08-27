import { Status } from 'src/app/modules/category';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AuthService } from '../auth/auth.service';
import { catchError, take } from 'rxjs/operators';
import { environment } from 'src/app/demo/enviroments/environment';
import { map, filter } from 'rxjs/operators';
export interface Notification {
    id: string;
    message?: string;
    noticeAt: string;
    isRead: boolean;
    announcementId?: number; // Add this property
    sender: string; // Correct the property name from 'Sender' to 'sender'
    senderName: string; // Correct the property name from 'SenderName' to 'senderName'
    category: string;
    sentTo: string;
    status: 'REQUESTED' | 'APPROVED' | 'DECLINED'; // Add this property
    type: string;
    userId: string;
    targetId: string;
    timestamp?: any;
  }


@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private apiUrl = environment.apiUrl + '/api/v1/notifications';
  private notificationsCollection: AngularFirestoreCollection<any>;

  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {
    this.notificationsCollection = this.firestore.collection('notifications');
    this.loadNotifications();
  }

  loadNotifications(): void {
    const userId = this.authService.userId;

    if (userId) {
      console.log('Querying notifications for userId:', userId);

      this.firestore.collection('notifications', ref =>
        ref.where('targetId', '==', userId)
           .orderBy('timestamp', 'desc')
           .orderBy('__name__', 'desc')
      ).valueChanges({ idField: 'id' }).pipe(
        catchError(error => {
          console.error('Error fetching notifications:', error);
          return of([]);
        })
      ).subscribe(
        (notifications: any[]) => {
          console.log('Fetched Notifications:', notifications);
          const unreadNotifications = notifications.filter(notification => !notification.isRead);
          this.notificationsSubject.next(notifications);
          this.unreadCountSubject.next(unreadNotifications.length);
        }
      );
    } else {
      console.warn('Sender is undefined. Cannot load notifications.');
    }
  }

  markAsRead(notificationId: string): void {
    const userId = this.authService.userId;

    this.firestore.collection('notifications').doc(notificationId).get().subscribe(doc => {
      if (doc.exists) {
        const notif = doc.data() as { targetId: string; isRead: boolean };

        if (notif.targetId === userId && !notif.isRead) {
          this.firestore.collection('notifications').doc(notificationId).update({ isRead: true })
            .then(() => {
              console.log('Notification marked as read in Firebase.');

              // Update local state
              const notifications = this.notificationsSubject.getValue();
              const updatedNotifications = notifications.map(n =>
                n.id === notificationId ? { ...n, isRead: true } : n
              );
              this.notificationsSubject.next(updatedNotifications);

              // Update unread count
              const unreadCount = updatedNotifications.filter(n => !n.isRead && n.targetId === userId).length;
              this.unreadCountSubject.next(unreadCount);
            })
            .catch(error => {
              console.error('Error marking notification as read in Firebase:', error);
            });
        } else {
          console.warn('Notification already read or does not belong to the user.');
        }
      } else {
        console.error('Notification not found.');
      }
    });
  }

  markAllAsRead(): void {
    const userId = this.authService.userId;

    if (!userId) {
      console.warn('User ID is not available. Cannot mark notifications as read.');
      return;
    }

    this.notifications$.pipe(take(1)).subscribe((notifications) => {
      const unreadNotifications = notifications.filter(notification => !notification.isRead);

      if (unreadNotifications.length > 0) {
        const batch = this.firestore.firestore.batch();

        unreadNotifications.forEach(notification => {
          batch.update(this.firestore.collection('notifications').doc(notification.id).ref, {
            isRead: true,
          });
        });

        batch.commit()
          .then(() => {
            console.log('All notifications marked as read in Firebase.');

            // Update unread count and notifications state
            this.resetUnreadCount();
            const updatedNotifications = notifications.map(notification => ({
              ...notification,
              isRead: true,
            }));
            this.notificationsSubject.next(updatedNotifications);
          })
          .catch(error => {
            console.error('Error updating notifications in Firebase:', error);
          });
      } else {
        console.log('No unread notifications found for this user.');
      }
    });
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

  updateNotificationStatusForApproval(notificationId: string, targetUserIds: string[]): void {
    const userId = this.authService.userId;

    if (!userId) {
      console.warn('User ID is undefined. Cannot update notification status.');
      return;
    }

    // Update the status for the creator (requester)
    this.firestore.collection('notifications').doc(notificationId).get().subscribe(doc => {
      if (doc.exists) {
        const notif = doc.data() as Notification;

        if (notif.status === 'REQUESTED') {
          this.firestore.collection('notifications').doc(notificationId).update({ status: 'APPROVED' })
            .then(() => {
              console.log('Creator notification status updated to APPROVED.');

              // Update local state
              const notifications = this.notificationsSubject.getValue();
              const updatedNotifications = notifications.map(n =>
                n.id === notificationId ? { ...n, status: 'APPROVED' } : n
              );
              this.notificationsSubject.next(updatedNotifications);

              // Update the status for MAIN_HR and HR
              this.updateStatusForTargets(notif.announcementId.toString(), targetUserIds);
            })
            .catch(error => {
              console.error('Error updating creator notification status:', error);
            });
        }
      } else {
        console.error('Notification not found.');
      }
    });
  }


  private updateStatusForTargets(announcementId: string, targetUserIds: string[]): void {
    targetUserIds.forEach(targetId => {
      this.firestore.collection('notifications', ref =>
        ref.where('announcementId', '==', announcementId).where('targetId', '==', targetId)
      ).get().subscribe(querySnapshot => {
        querySnapshot.forEach(doc => {
          const notification = doc.data() as Notification;

          if (notification.status === 'REQUESTED') {
            this.firestore.collection('notifications').doc(doc.id).update({ status: 'APPROVED' })
              .then(() => {
                console.log(`Notification for target ${targetId} updated to APPROVED.`);

                // Update local state
                const notifications = this.notificationsSubject.getValue();
                const updatedNotifications = notifications.map(n =>
                  n.id === doc.id ? { ...n, status: 'APPROVED' } : n
                );
                this.notificationsSubject.next(updatedNotifications);
              })
              .catch(error => {
                console.error(`Error updating notification for target ${targetId}:`, error);
              });
          }
        });
      });
    });
  }
  approveNotification(notificationId: string): Observable<void> {
    return new Observable(observer => {
      this.firestore.collection('notifications').doc(notificationId).get().subscribe(doc => {
        if (doc.exists) {
          const notif = doc.data() as Notification;

          if (notif.status === 'REQUESTED') {
            this.firestore.collection('notifications').doc(notificationId).update({ status: 'APPROVED' })
              .then(() => {
                console.log(`Notification ${notificationId} status updated to APPROVED.`);
                observer.next();
                observer.complete();
              })
              .catch(error => {
                console.error(`Error updating notification ${notificationId} status:`, error);
                observer.error(error);
              });
          } else {
            console.warn(`Notification ${notificationId} status is not REQUESTED.`);
            observer.next();
            observer.complete();
          }
        } else {
          console.error(`Notification ${notificationId} not found.`);
          observer.error('Notification not found');
        }
      });
    });
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
}

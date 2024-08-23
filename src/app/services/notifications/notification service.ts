import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private apiUrl = 'http://localhost:8080/api/v1/notifications';

  constructor(private http: HttpClient, private firestore: AngularFirestore) {
    this.loadNotifications();
  }

  loadNotifications() {
    this.firestore.collection('notifications', ref => ref.orderBy('noticeAt', 'desc'))
      .valueChanges({ idField: 'id' })
      .subscribe((notifications: any[]) => {
        const unreadNotifications = notifications.filter(notification => !notification.isRead);
        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(unreadNotifications.length);
      });
  }

  markAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.getValue();
    const notification = notifications.find(n => n.id === notificationId);

    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.notificationsSubject.next(notifications);
      this.firestore.collection('notifications').doc(notificationId).update({ isRead: true });
      this.unreadCountSubject.next(this.unreadCountSubject.value - 1);
    }
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.getValue();
    const unreadNotifications = notifications.filter(n => !n.isRead);

    if (unreadNotifications.length > 0) {
      unreadNotifications.forEach(notification => {
        notification.isRead = true;
      });
      this.notificationsSubject.next(notifications);
      this.unreadCountSubject.next(0);

      const batch = this.firestore.firestore.batch();
      unreadNotifications.forEach(notification => {
        const notificationRef = this.firestore.collection('notifications').doc(notification.id).ref;
        batch.update(notificationRef, { isRead: true });
      });

      batch.commit().then(() => {
        this.http.post(`${this.apiUrl}/mark-all-read`, {}).subscribe();
      }).catch(error => {
        console.error("Error updating notifications: ", error);
      });
    }
  }

  addNotification(notification: any) {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);
    this.incrementUnreadCount();
    this.firestore.collection('notifications').add(notification);
  }

  incrementUnreadCount() {
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
  }

  resetUnreadCount() {
    this.unreadCountSubject.next(0);
  }

  sendNotification(notificationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, notificationData);
  }
}

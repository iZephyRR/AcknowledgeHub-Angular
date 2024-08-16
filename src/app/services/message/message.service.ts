import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }
  
  comfirmed(message:string): boolean{
    return window.confirm(message);
  }
  
  requestWindowNotiPermit(): void {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
          console.log('Notification permission denied');
        }
      });
    } else {
      console.error('This browser does not support notifications.');
    }
  }

  sentWindowNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }
}

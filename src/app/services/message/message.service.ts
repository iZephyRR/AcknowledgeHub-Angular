import { Injectable } from '@angular/core';
import { Message, MessageService } from 'primeng/api';

type MessageType = 'info' | 'warn' | 'error' | 'success';
@Injectable({
  providedIn: 'root'
})
export class MessageDemoService {

  msgs: Message[] = [];
  constructor(private service: MessageService) { }

  comfirmed(message: string): boolean {
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

  toast(type: MessageType, summary: string, detail?: string) {
    this.service.add({ key: 'tst', severity: type, summary: summary, detail: detail });
  }
  
  message(type: MessageType, summary: string, detail?: string): void {
    this.msgs = [];
    this.msgs.push({ severity: type, summary: summary, detail: detail });
  }

}

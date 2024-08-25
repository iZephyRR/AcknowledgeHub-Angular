import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message, MessageService } from 'primeng/api';
import { catchError, Observable } from 'rxjs';
import { MessageType } from 'src/app/constants';
import { Email } from 'src/app/modules/email';

@Injectable({
  providedIn: 'root'
})
export class MessageDemoService {

  msgs: Message[] = [];
  constructor(
    private service: MessageService,
    private http:HttpClient
  ) { }

  comfirmed(message: string): boolean {
    return window.confirm(message);
  }

//  showCustomConfirm(message: string): Promise<boolean> {
//     return new Promise((resolve) => {
//         // Create the modal elements
//         const modal = document.createElement('div');
//         modal.style.position = 'fixed';
//         modal.style.top = '0';
//         modal.style.left = '0';
//         modal.style.width = '100%';
//         modal.style.height = '100%';
//         modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
//         modal.style.display = 'flex';
//         modal.style.justifyContent = 'center';
//         modal.style.alignItems = 'center';
//         modal.style.zIndex = '1000';

//         const dialog = document.createElement('div');
//         dialog.style.backgroundColor = 'white';
//         dialog.style.padding = '20px';
//         dialog.style.borderRadius = '5px';
//         dialog.style.textAlign = 'center';

//         const text = document.createElement('p');
//         text.textContent = message;

//         const yesButton = document.createElement('button');
//         yesButton.textContent = 'Yes';
//         yesButton.style.marginRight = '10px';
//         yesButton.addEventListener('click', () => {
//             resolve(true);
//             document.body.removeChild(modal);
//         });

//         const noButton = document.createElement('button');
//         noButton.textContent = 'No';
//         noButton.addEventListener('click', () => {
//             resolve(false);
//             document.body.removeChild(modal);
//         });

//         dialog.appendChild(text);
//         dialog.appendChild(yesButton);
//         dialog.appendChild(noButton);
//         modal.appendChild(dialog);
//         document.body.appendChild(modal);
//     });
// }

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

  
  sendEmail(email:Email):Observable<void>{
    console.log('Sending email'+JSON.stringify(email));
    return this.http.post<void>(`http://localhost:8080/api/v1/auth/send-email`,email);
  }

}

import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Message, MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { Color, MessageType } from 'src/app/constants';
import { Email } from 'src/app/modules/email';

@Injectable({
  providedIn: 'root'
})
export class MessageDemoService {

  msgs: Message[] = [];
  constructor(
    private service: MessageService,
    private http: HttpClient
  ) { }

  confirmed(
    header: string,
    message: string,
    okBtnText: string,
    cancelBtnText: string,
    backgroundColor: Color,
    primaryColor: Color,
    hasInput?: boolean
  ): Promise<{ confirmed: boolean; inputValue?: string }> {
    return new Promise((resolve) => {
      const modal = document.createElement("div");
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.width = "100%";
      modal.style.height = "100%";
      modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      modal.style.display = "flex";
      modal.style.justifyContent = "center";
      modal.style.alignItems = "center";
      modal.style.zIndex = "1000";

      const dialog = document.createElement("div");
      dialog.style.backgroundColor = backgroundColor;
      dialog.style.padding = "30px";
      dialog.style.borderRadius = "10px";
      dialog.style.textAlign = "center";
      dialog.style.width = "300px";

      const text = document.createElement("p");
      text.textContent = header;
      text.style.marginBottom = "20px";
      text.style.fontSize = "18px";
      text.style.fontWeight = "bold";
      text.style.color = primaryColor;
      text.style.cursor = "default";

      const subtext = document.createElement("p");
      subtext.textContent = message;
      subtext.style.marginBottom = "20px";
      subtext.style.fontSize = "14px";
      subtext.style.color = "#666";
      subtext.style.cursor = "default";

      let inputBox: HTMLInputElement | undefined;

      if (hasInput) {
        inputBox = document.createElement("input");
        inputBox.type = "text";
        inputBox.placeholder = "Enter your text here";
        inputBox.style.width = "100%";
        inputBox.style.padding = "8px";
        inputBox.style.marginBottom = "30px";
        inputBox.style.borderRadius = "5px";
        inputBox.style.border = "1px solid #ccc";

        // Set the initial state of the yesButton to disabled
        inputBox.oninput = function () {
          if (inputBox!.value === "") {
            yesButton.style.opacity = "80%";
            yesButton.disabled = true;
            yesButton.style.cursor = "not-allowed";
          } else {
            yesButton.style.opacity = "100%";
            yesButton.disabled = false;
            yesButton.style.cursor = "pointer";
          }
        };
      }

      const yesButton = document.createElement("button");
      yesButton.textContent = okBtnText;
      yesButton.style.backgroundColor = primaryColor;
      yesButton.style.color = backgroundColor;
      yesButton.style.border = "none";
      yesButton.style.padding = "10px 20px";
      yesButton.style.borderRadius = "5px";
      yesButton.style.marginRight = "10px";
      yesButton.style.cursor = "pointer";

      // Initially disable the yesButton if there is an input field
      if (hasInput && inputBox!.value === "") {
        yesButton.disabled = true;
        yesButton.style.opacity = "80%";
        yesButton.style.cursor = "not-allowed";
      }

      yesButton.addEventListener("click", () => {
        if (hasInput) {
          resolve({ confirmed: true, inputValue: inputBox!.value });
        } else {
          resolve({confirmed:true});
        }
        document.body.removeChild(modal);
      });

      const noButton = document.createElement("button");
      noButton.textContent = cancelBtnText;
      noButton.style.backgroundColor = backgroundColor;
      noButton.style.color = primaryColor;
      noButton.style.border = `2px solid ${primaryColor}`;
      noButton.style.padding = "10px 20px";
      noButton.style.borderRadius = "5px";
      noButton.style.cursor = "pointer";
      noButton.addEventListener("click", () => {
        resolve({confirmed:false});
        document.body.removeChild(modal);
      });

      dialog.appendChild(text);
      dialog.appendChild(subtext);
      if (hasInput) {
        dialog.appendChild(inputBox!);
      }
      dialog.appendChild(yesButton);
      dialog.appendChild(noButton);
      modal.appendChild(dialog);
      document.body.appendChild(modal);
    });
  }


  alert(header: string, message: string, okBtnStyle: 'OUTSET' | 'INSET', backgroundColor: Color, primaryColor: Color): void {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    const dialog = document.createElement('div');
    dialog.style.backgroundColor = backgroundColor;
    dialog.style.padding = '30px';
    dialog.style.borderRadius = '10px';
    dialog.style.textAlign = 'center';
    dialog.style.width = '300px';

    const text = document.createElement('p');
    text.textContent = header;
    text.style.marginBottom = '20px';
    text.style.fontSize = '18px';
    text.style.fontWeight = 'bold';
    text.style.color = primaryColor;

    const subtext = document.createElement('p');
    subtext.textContent = message;
    subtext.style.marginBottom = '30px';
    subtext.style.fontSize = '14px';
    subtext.style.color = '#666';

    const button = document.createElement('button');
    button.textContent = 'OK';
    if (okBtnStyle == 'INSET') {
      button.style.backgroundColor = backgroundColor;
      button.style.color = primaryColor;
      button.style.border = `2px solid ${primaryColor}`;
    } else {
      button.style.backgroundColor = primaryColor;
      button.style.color = backgroundColor;
      button.style.border = 'none';
    }

    button.style.padding = '10px 20px';
    button.style.borderRadius = '5px';
    button.style.marginRight = '10px';
    button.style.cursor = 'pointer';
    button.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    dialog.appendChild(text);
    dialog.appendChild(subtext);
    dialog.appendChild(button);
    modal.appendChild(dialog);
    document.body.appendChild(modal);
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

  toast(type: MessageType, detail: string) {
    switch (type) {
      case 'error':
        this.service.add({ key: 'tst', severity: type, summary: 'ERROR!', detail: detail });
        break;
      case 'info':
        this.service.add({ key: 'tst', severity: type, summary: 'INFO', detail: detail });
        break;
      case 'warn':
        this.service.add({ key: 'tst', severity: type, summary: 'WARNING!', detail: detail });
        break;
      default:
        this.service.add({ key: 'tst', severity: type, summary: 'SUCCESS', detail: detail });
        break;
    }
  }

  message(type: MessageType, detail: string): void {
    this.msgs = [];
    switch (type) {
      case 'error':
        this.msgs.push({ severity: type, summary: 'ERROR!', detail: detail });
        break;
      case 'info':
        this.msgs.push({ severity: type, summary: 'INFO', detail: detail });
        break;
      case 'warn':
        this.msgs.push({ severity: type, summary: 'WARNING!', detail: detail });
        break;
      default:
        this.msgs.push({ severity: type, summary: 'SUCCESS', detail: detail });
        break;
    }
  }

  sendEmail(email: Email): Observable<void> {
    const formData: FormData = new FormData();
    formData.append('subject', email.subject);
    formData.append('address', email.address);
    formData.append('message', email.message);
    if (email.file) {
      formData.append('file', email.file);
    }
    return this.http.post<void>(`http://localhost:8080/api/v1/auth/send-email`, formData);
  }
}

import { Injectable } from '@angular/core';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { AuthService } from '../auth/auth.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient: Client;
  private socketUrl: string = 'http://localhost:8080/api/v1/ws';

  // Subject to emit notifications
  private notificationSubject = new Subject<any>();
  notifications$ = this.notificationSubject.asObservable();

  constructor(private authService: AuthService) {}

  connect() {
    const token = this.authService.getToken(); // Get the JWT token from your AuthService

    // Initialize the STOMP client
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`, // Add the token to the headers
      },
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // Handle the connection
    this.stompClient.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      // Subscribe to the notification topic
      this.stompClient.subscribe('/topic/notifications', (message: IMessage) => {
        const notification = JSON.parse(message.body);
        this.notificationSubject.next(notification); // Emit the notification through the subject
      });
    };

    // Handle connection errors
    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    // Activate the STOMP client (connect to the server)
    this.stompClient.activate();
  }
}

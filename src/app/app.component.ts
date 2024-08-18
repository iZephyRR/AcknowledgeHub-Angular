import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { Message, PrimeNGConfig } from 'primeng/api';
import { MessageDemoService } from './services/message/message.service';
import { AuthService } from './services/auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {


  constructor(private primengConfig: PrimeNGConfig,
    public messageService: MessageDemoService
  ) { }

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.messageService.requestWindowNotiPermit();
  }

  // initializeEventSource() {
  //   const eventSource = new EventSource(`${this.authService.baseUrl}/checking`);

  //   eventSource.onmessage = (event) => {
  //     this.zone.run(() => {
  //       console.log('Data received: ', event.data);
  //       const data=JSON.parse(event.data);
  //       this.authService.checkAuth = data;
  //       console.log('authCheck : '+JSON.stringify(this.authService.checkAuth));
  //     });
  //   };

  //   eventSource.onerror = (error) => {
  //     this.zone.run(() => {
  //       console.error('EventSource failed: ', error);
  //       eventSource.close();
  //     });
  //   };
  // }
}
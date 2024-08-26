import { Component, OnInit, AfterViewInit, NgZone, HostListener } from '@angular/core';
import { Message, PrimeNGConfig } from 'primeng/api';
import { MessageDemoService } from './services/message/message.service';
import { AuthService } from './services/auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SystemService } from './services/system/system.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {


  constructor(
    private primengConfig: PrimeNGConfig,
    public messageService: MessageDemoService,
    public systemService: SystemService
  ) { }

  ngOnInit() {
      this.systemService.showLoading('');
      this.primengConfig.ripple = true;
      this.messageService.requestWindowNotiPermit();

  }
}
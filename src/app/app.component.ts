import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { MessageService } from './services/message/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private primengConfig: PrimeNGConfig,private messageService:MessageService) { }

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.messageService.requestWindowNotiPermit();
  }
}
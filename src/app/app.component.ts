import { Component, OnInit, AfterViewInit, NgZone, HostListener, signal } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { MessageDemoService } from './services/message/message.service';
import { AuthService } from './services/auth/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SystemService } from './services/system/system.service';
import { Subscription } from 'rxjs';
import { UserService } from './services/user/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private routerSubscription: Subscription;
  constructor(
    private primengConfig: PrimeNGConfig,
    public messageService: MessageDemoService,
    public systemService: SystemService,
    private router: Router,
    public authService: AuthService,
    public userService: UserService
  ) { }

  ngOnInit() {
    this.systemService.showLoading('');
    //this.authService.restartPage();
    this.authService.severConnectionTest();
    this.primengConfig.ripple = true;
    this.messageService.requestWindowNotiPermit();
   // this.messageService.sentWindowNotification('Title', { body: 'Testing', icon: 'assets\\demo\\images\\avatar\\amyelsner.png' });
    this.routerSubscription = this.router.events.subscribe(event => {
       if (event instanceof NavigationEnd) {
         this.systemService.currentRout.set(event.urlAfterRedirects);
       }
    });
  }
}

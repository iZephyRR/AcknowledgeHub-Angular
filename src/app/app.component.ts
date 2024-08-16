import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { Role } from './modules/check-auth';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private primengConfig: PrimeNGConfig) { }

  ngOnInit() {
    this.primengConfig.ripple = true;
  }
}
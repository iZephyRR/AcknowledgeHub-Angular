import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Login } from 'src/app/modules/login';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SystemService } from 'src/app/services/system/system.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class LoginComponent implements OnInit{

    valCheck: string[] = ['remember'];
    login: Login = {} as Login;
    password!: string;

    constructor(public layoutService: LayoutService,private router: Router,private authService:AuthService,public systemService:SystemService) { }

    
  onSubmit(): void {
    this.authService.login(this.login);
  }

  ngOnInit(): void {
      this.systemService.hideSpinner();
  }
}

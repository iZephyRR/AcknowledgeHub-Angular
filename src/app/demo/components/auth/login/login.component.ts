import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Login } from 'src/app/modules/login';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { MessageDemoService } from 'src/app/services/message/message.service';
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
export class LoginComponent implements OnInit {

  login: Login = {} as Login;
  isValid: boolean = true;

  constructor(
    public layoutService: LayoutService,
    private router: Router,
    private authService: AuthService,
    public systemService: SystemService,
    public messageService: MessageDemoService,
    private session: LocalStorageService
  ) { }


  onSubmit(): void {
    this.authService.login(this.login).pipe(
      catchError(error => {
        if (error.status == 401) {
          this.messageService.message('error', 'Account deactivated.', 'This account has been deactivated!');
          this.isValid = true;
        } else {
          this.isValid = false;
        }
        console.log('error : ' + error)
        this.router.navigate(['/auth/login']);
        return throwError(error);
      })
    )
      .subscribe(response => {
        this.session.add('token', response.jwt_TOKEN);
        console.log('saved token : ' + this.session.get('token'));
        this.messageService.toast('success', 'Login success', 'Successfully logged in!');
        this.router.navigate(['/']);
        this.isValid = true;
      });
  }

    test():void{
  
      this.authService.sendEmail({address:'luminhtet.mm22@gmail.com',subject:'Testing',message:'Hello testing...'}).subscribe();
    }

  ngOnInit(): void {
    this.systemService.hideSpinner();

  }
}

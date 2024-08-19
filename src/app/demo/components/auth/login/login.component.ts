import { Component, OnInit } from '@angular/core';
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
            transform: scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class LoginComponent implements OnInit {

  login: Login = {} as Login;
  isValid: boolean = true;
    email: string = '';
    newPassword: string = '';
    confirmPassword: string = '';
    displayForgotPasswordDialog: boolean = false;
    displayOtpDialog: boolean = false;
    displayResetPasswordDialog: boolean = false;
    otp1: string = '';
    otp2: string = '';
    otp3: string = '';
    otp4: string = '';
    otp5: string = '';
    otp6: string = '';
    errorMessage: string | null = null;

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

  ngOnInit(): void {
    this.systemService.hideSpinner();

  }
   showForgotPasswordDialog() {
        this.displayForgotPasswordDialog = true;
    }

    sendOtp() {
        this.displayForgotPasswordDialog = false;
        this.displayOtpDialog = true;
        // Implement logic to send OTP to the entered email address
    }

    verifyOtp(): void {
        const otp = `${this.otp1}${this.otp2}${this.otp3}${this.otp4}${this.otp5}${this.otp6}`;
        if (otp.length !== 6) {
            this.errorMessage = 'OTP must be 6 digits long.';
        } else {
            this.errorMessage = '';
            console.log('OTP Verified:', otp);

            // If OTP is verified, show the reset password form
            this.displayOtpDialog = false;
            this.displayResetPasswordDialog = true;
        }
    }

    onInputKeyup(event: KeyboardEvent, nextInput: HTMLInputElement | null): void {
        const input = event.target as HTMLInputElement;
        const key = event.key;

        if (key === 'Backspace' && input.value === '') {
            const prevInput = input.previousElementSibling as HTMLInputElement;
            if (prevInput) {
                prevInput.focus();
            }
        } else if (input.value && nextInput) {
            nextInput.focus();
        }
    }

    resendCode(): void {
        // Implement the resend OTP logic here
        console.log('Resend code');
    }

    resetPassword() {
        if (this.newPassword !== this.confirmPassword) {
            this.errorMessage = 'Passwords do not match.';
        } else {
            this.errorMessage = '';
            console.log('Password reset successfully:', this.newPassword);
            // Implement password reset logic here, then close the dialog
            this.displayResetPasswordDialog = false;
        }
    }
}
   
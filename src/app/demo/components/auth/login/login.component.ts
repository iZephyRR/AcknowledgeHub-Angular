import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Login } from 'src/app/modules/login';
import { OTPMail } from 'src/app/modules/otp-mails';
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

  login = {} as Login;
  isValid: boolean = true;
  isFirstTime: boolean = false;
  name: string = '';
  id: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  displayForgotPasswordDialog: boolean = false;
  displayOtpDialog: boolean = false;
  otpDialogMessage = '';
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
    public authService: AuthService,
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
        if (response.login_RESPONSE.startsWith('NAME_')) {
          this.isFirstTime = true;
          const responseArray = response.login_RESPONSE.split('_');
          this.name = responseArray[1];
          this.id = responseArray[3];
          if (this.messageService.comfirmed('"Welcome! For your security, please update your password as you are currently using the default password. Click yes to change your password now."')) {
            this.messageService.sendEmail(OTPMail.firstLogin(this.login.email, this.name)).subscribe({
              complete: () => {
                this.otpDialogMessage = 'We have sent an OTP to your email ' + this.maskEmail(this.login.email) + '.'
                this.showOTPDialog();
              }
            });
          }
        } else {
          this.session.add('token', response.login_RESPONSE);
          console.log('saved token : ' + this.session.get('token'));
          this.messageService.toast('success', 'Login success', 'Successfully logged in!');
          this.router.navigate(['/']);
        }
        this.isValid = true;
      });
  }

  ngOnInit(): void {
    this.systemService.hideSpinner();
  }

  showOTPDialog() {
    this.displayOtpDialog = true;
  }

  hideOTPDialog() {
    this.displayOtpDialog = false;
  }

  verifyOtp(): void {
    let otp = `${this.otp1}${this.otp2}${this.otp3}${this.otp4}${this.otp5}${this.otp6}`;
    console.log('Storaged otp : ' + OTPMail.otp);
    console.log('Input otp : ' + otp);
    console.log(otp == (OTPMail.otp + ''));
    if (otp == (OTPMail.otp + '')) {
      this.hideOTPDialog();
      this.displayResetPasswordDialog = true;
      this.errorMessage = '';
      otp = '';
      this.otp1 = '';
      this.otp2 = '';
      this.otp3 = '';
      this.otp4 = '';
      this.otp5 = '';
      this.otp6 = '';
    } else {
      this.errorMessage = 'Incorrect OTP.';
    }
  }
  onInput(event: Event, nextInput: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement;

    // Move to the next input if the current input has a value
    if (input.value && nextInput) {
        nextInput.focus();
    }
}

onInputKeydown(event: KeyboardEvent, currentInput: HTMLInputElement, prevInput: HTMLInputElement | null) {
    const key = event.key;

    if (key === 'Backspace') {
        if (currentInput.value === '') {
            // Move to the previous input if the current input is empty and backspace is pressed
            if (prevInput) {
                prevInput.focus();
            }
        } else {
            // Clear the current input and keep focus on it
            currentInput.value = '';
            event.preventDefault(); // Prevent the cursor from moving backward
        }
    }
}

  maskEmail(email: string): string {
    const atIndex = email.indexOf('@');
    if (atIndex > 2) {
      const firstPart = email.substring(0, 2);
      const lastPart = email.substring(atIndex);
      const maskedPart = '*'.repeat(atIndex - 2);
      return `${firstPart}${maskedPart}${lastPart}`;
    }
    return email; // Return the original email if it's too short to mask
  }

  resendCode(name: string): void {
    this.hideOTPDialog();
    console.log('Resending otp..');
    this.messageService.sendEmail(OTPMail.firstLogin(this.login.email, name)).subscribe({
      complete: () => {
        this.otpDialogMessage = 'We have resent a new OTP to your email ' + this.maskEmail(this.login.email) + '.'
        this.showOTPDialog();
      }
    });
  }

  preventNonNumeric(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  resetPassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
    } else {
      this.errorMessage = '';
      this.displayResetPasswordDialog = false;
      this.authService.changePassword(this.newPassword, this.id).subscribe({
        complete: () => {
          this.messageService.toast('success', 'Change password success.');
        },
        error: () => {
          this.messageService.toast('error', 'Failed to change password.');
        }
      });
      this.newPassword = '';
      this.confirmPassword = '';
    }
  }
}

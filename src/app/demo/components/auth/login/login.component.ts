import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Subscription, throwError, timer } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Login } from 'src/app/modules/login';
import { Mail } from 'src/app/modules/mails';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CustomTargetGroupService } from 'src/app/services/custom-target-group/custom-target-group.service';
import { DepartmentService } from 'src/app/services/department/department.service';
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
  email: string;
  isValid: boolean = true;
  isFirstTime: boolean = false;
  forgotPasswordMessage = '';
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
  combinedOTP: string = '';
  errorMessage: string | null = null;
  remainingTime: number = 120; // 120 seconds countdown
  isCountingDown: boolean = true; // Controls the countdown display
  countdownInterval: any; // Reference to the countdown interval
  private countdownSubscription: Subscription | null = null;

  constructor(
    public layoutService: LayoutService,
    private router: Router,
    public authService: AuthService,
    public systemService: SystemService,
    public messageService: MessageDemoService,
    private session: LocalStorageService,
    public departmentService:DepartmentService
  ) { }


  canClickOTP(): boolean {
    this.combinedOTP = `${this.otp1}${this.otp2}${this.otp3}${this.otp4}${this.otp5}${this.otp6}`;
    return this.combinedOTP.length === 6; 
  }

  // showOTPDialog() {
  //   this.displayOtpDialog = true;
  // }

  hideOTPDialog(): void {
    this.displayOtpDialog = false;
  }

  ngOnInit(): void {
    this.authService.showNotFound=false;
    this.authService.xShowNotFound=true;
    this.startCountdown();
    this.authService.severConnectionTest();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval); // Clear interval when component is destroyed
    }
  }

  onInput(event: Event, nextInput: HTMLInputElement | null): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 0 && nextInput) {
      nextInput.focus();
    }
    this.updateCombinedOTP();
  }

  onInputKeydown(event: KeyboardEvent, currentInput: HTMLInputElement, previousInput: HTMLInputElement | null): void {
    if (event.key === 'Backspace' && !currentInput.value && previousInput) {
      previousInput.focus();
    }
    this.updateCombinedOTP();
  }

  updateCombinedOTP(): void {
    this.combinedOTP = `${this.otp1}${this.otp2}${this.otp3}${this.otp4}${this.otp5}${this.otp6}`;
  }

  onSubmit(): void {
    this.systemService.showLoading('Logging in..',true);
    if (this.login.email != undefined && this.login.email != '' && this.login.password != undefined && this.login.password != '') {
      this.authService.login(this.login).pipe(
        catchError(error => {
          if (error.status == 401) {
            this.messageService.message('warn', 'This account has been deactivated!');
            this.isValid = true;
          } else {
            this.isValid = false;
          }
          console.log('error : ' + error);
          this.systemService.hideLoading();
          return throwError(error);
        })
      )
        .subscribe({
          next: async (response) => {
            if (response.STRING_RESPONSE.startsWith('NAME_')) {
              this.isFirstTime = true;
              this.name = response.STRING_RESPONSE.substring(5);
              this.systemService.hideLoading();
              if ((await this.messageService.confirmed('Security Alert!', '"Welcome! For your security, please update your password as you are currently using the default password. Click yes to change your password now."', 'YES', 'NO', 'WHITE', 'YELLOWGREEN')).confirmed) {
                if (AuthService.isDomainAvailable(this.login.email)) {
                  setTimeout(() => {
                    this.systemService.showLoading('Sending OTP...',true);
                  }, 0);
                  Mail.action = 'FIRST_LOGIN';
                  this.email = this.login.email;
                  this.messageService.sendEmail(Mail.firstLogin(this.email, this.name)).subscribe({
                    complete: () => {
                      this.systemService.hideLoading();
                      this.otpDialogMessage = 'We have sent an OTP to your email ' + this.maskEmail(this.email) + '.';
                      this.showOTPDialog();
                    },
                    error: (err) => {
                      this.systemService.hideLoading();
                      this.messageService.toast('error', 'An error occured when sending OTP code.');
                      console.log(JSON.stringify(err));
                    }
                  });
                } else {
                  this.messageService.message('info', 'The email of your account do not have a valid domain. If you want to change your password, you have to connect to IT Support.');
                }
              }
            } else {
              this.session.add('token', response.STRING_RESPONSE);
              this.messageService.toast('success', 'Successfully logged in!');
              this.authService.restartPage();
            }
            this.isValid = true;
            this.systemService.hideLoading();
          }
        }
        );
    } else {
      this.systemService.hideLoading();
      this.isValid = false;
    }
  }

  verifyOtp(): void {
    // let otp = `${this.otp1}${this.otp2}${this.otp3}${this.otp4}${this.otp5}${this.otp6}`;
    console.log(this.combinedOTP == (Mail.otp + ''));
    if (this.combinedOTP == (Mail.otp + '')) {
      this.hideOTPDialog();
      this.displayResetPasswordDialog = true;
      this.errorMessage = '';
      this.combinedOTP = '';
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
    if (this.isCountingDown) return; // Prevent multiple clicks
  
    // Show loading and send OTP
    this.systemService.showLoading('Resending OTP...');
    this.hideOTPDialog();
    this.messageService.toast('info', 'Resending OTP...');
    console.log('Resending OTP...');
  
    const otpEmail =
    Mail.action === 'FIRST_LOGIN'
        ? Mail.firstLogin(this.email, name)
        : Mail.forgotPassword(this.email, name);
    this.sendOtpEmail(otpEmail);
  }
  
  private sendOtpEmail(otpEmail: any): void {
    this.messageService.sendEmail(otpEmail).subscribe({
      complete: () => {
        this.systemService.hideLoading();
        this.otpDialogMessage =
          'We have resent a new OTP to your email ' + this.maskEmail(this.email) + '.';
        this.showOTPDialog(); // Start the countdown when the dialog is shown
      },
      error: (err) => {
        console.error('Error while resending OTP:', err);
        this.systemService.hideLoading();
      },
    });
  }
  
  private showOTPDialog(): void {
      this.displayOtpDialog = true;
    this.startCountdown(); // Start countdown when OTP dialog is displayed
  }
  
  private startCountdown(): void {
    this.isCountingDown = true;
    this.remainingTime = 120; // Set initial time to 120 seconds
  
    // Unsubscribe if there was a previous countdown
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  
    // Timer that emits values every 1 second
    this.countdownSubscription = timer(0, 1000).subscribe((secondsElapsed) => {
      this.remainingTime = 120 - secondsElapsed;
  
      if (this.remainingTime <= 0) {
        this.isCountingDown = false; // Stop countdown when time is up
        this.stopCountdown();
      }
    });
  }
  
  private stopCountdown(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }
  
  
  sendPasswordChangeOTP(): void {
    this.systemService.showLoading('Sending OTP..');
    console.log("Email : " + this.email);
    this.authService.isPasswordDefault(this.email).subscribe({
      next: (data) => {
        console.log(data);
        if (!data.STRING_RESPONSE) {
          this.authService.findNameByEmail(this.email).subscribe({
            next: (data) => {
              console.log('findNameByEmail ' + data.STRING_RESPONSE);
              if (AuthService.isDomainAvailable(this.email)) {
                console.log('Responsed data : ' + data.STRING_RESPONSE);
                this.name = data.STRING_RESPONSE;
                this.hideForgotPasswordDialog();
                Mail.action = 'FORGOT_PASSWORD';
                this.messageService.sendEmail(Mail.forgotPassword(this.email, this.name)).subscribe({
                  complete: () => {
                    this.systemService.hideLoading();
                    this.otpDialogMessage = 'We have sent an OTP to your email ' + this.maskEmail(this.email) + '.'
                    this.showOTPDialog();
                  }
                });
              } else {
                this.systemService.hideLoading();
                this.messageService.message('info', 'The email of your account have a unavailible domain. If you want to change your password, you have to connect to IT Support.');
              }
            },
            error: (err) => {
              console.error(err);
              if (err.status == 400) {
                this.messageService.message('warn', 'It looks like the email you entered is not registered on our service.');
              } else {
                this.messageService.message('info', 'Sorry, we\'ve a trouble. Please connect to IT Support.');
              }
              this.systemService.hideLoading();
            }
          });
        } else {
          this.systemService.hideLoading();
          this.messageService.message('warn', 'Your password is currently the default one. You cannot use the "Forgot Password" feature. Please reach out to HR if you don\'t remember your default password')
        }
      }
    });
  }

  preventNonNumeric(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  setfpMsg(): void {
    if (this.login.email == undefined || !AuthService.isDomainAvailable(this.login.email)) {
      this.email = '';
      this.forgotPasswordMessage = 'Please enter your email to receive an OTP code.';
    } else {
      this.email = this.login.email;
      this.forgotPasswordMessage = "Make sure the email address you entered is correct, we'll send the OTP there.";
    }
  }

  forgotPassword() {
    this.displayForgotPasswordDialog = true;
    this.setfpMsg();
  }

  hideForgotPasswordDialog() {
    this.displayForgotPasswordDialog = false;
  }
  resetPassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
    } else {
      this.errorMessage = '';
      this.displayResetPasswordDialog = false;
      this.authService.changePassword(this.newPassword, this.email).subscribe({
        complete: () => {
          this.messageService.toast('success', 'Change password success.');
        },
        error: (err) => {
          console.error(err);
          this.messageService.toast('error', 'Failed to change password.');
        }
      });
      this.newPassword = '';
      this.confirmPassword = '';
    }
  }
}

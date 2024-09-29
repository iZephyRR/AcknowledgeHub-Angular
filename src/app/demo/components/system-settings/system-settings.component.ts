import { Component, OnInit } from '@angular/core';
import { HR } from 'src/app/modules/company';
import { Mail } from 'src/app/modules/mails';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MessageDemoService } from 'src/app/services/message/message.service';
import { SystemService } from 'src/app/services/system/system.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrl: './system-settings.component.scss'
})
export class SystemSettingsComponent implements OnInit {
  
  defaultPassword: string = '';
  isPasswordVisible: boolean = false;
  canShow: boolean;
  existsMainHR: boolean;
  isServerInResting: boolean;
  mainHR = {} as {
    hrName: string,
    hrEmail: string,
    staffId: string,
    companyName:string
    
  };
  constructor(
    private messageService: MessageDemoService,
    private authService: AuthService,
    private systemService: SystemService,
    private userService: UserService

  ) { }
  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.userService.existsMainHR().subscribe({
      next: (data) => {
        this.existsMainHR = data;
      }
    });
    this.authService.getDefaultPassword().subscribe({
      next: (data) => {
        this.defaultPassword = data.STRING_RESPONSE;
      }
    });
    this.authService.isServerInResting().subscribe({
      next: (data) => {
        this.isServerInResting = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  async editDefaultPassword(): Promise<void> {
    const confirmed = await this.messageService.confirmed('Enter a new default password.', '', 'OK', 'Cancel', 'WHITE', 'GOLD', true);
    if (confirmed.confirmed) {
      this.authService.changeDefaultPassword(confirmed.inputValue).subscribe({
        next: (data) => {
          console.log('response ' + data.STRING_RESPONSE);
          this.defaultPassword = data.STRING_RESPONSE;
        },
        complete: () => {
          this.messageService.toast('info', 'System default password changed.');
        },
        error: () => {
          this.messageService.toast('error', 'Couldn\'t change default password.');
        }
        
      });
    }
  }

  addMainHR(): void {
    this.systemService.showProgress('Adding Main HR account...', true, false, 7);
    this.userService.addMainHR(this.mainHR).subscribe({
      next: (data) => {
        console.log('after save ' + JSON.stringify(data));
      },
      complete: () => {
        this.messageService.sendEmail(Mail.addedMainHR(this.mainHR.hrEmail, this.mainHR.hrName, this.defaultPassword)).subscribe({
          complete: () => {
            this.systemService.stopProgress().then((data) => {
              this.messageService.toast('success', 'Added main HR account.');
              this.refresh();
              this.closeDialog();
            });
          },
          error: (err) => {
            this.systemService.stopProgress().then((data) => {
              this.messageService.message('error', 'Registered main HR account but an error occured on sending email.');
              this.refresh();
              this.closeDialog();
            });
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.systemService.stopProgress('ERROR').then((data) => {
          this.messageService.message('error', 'An error occured when adding main HR acount.');
          this.refresh();
        });
        console.error(err);
      }
    });
  }

  closeDialog(): void {
    this.mainHR = {} as HR;
    this.canShow = false;
  }

  showDialog(): void {
    this.canShow = true;
  }

  async restServer(): Promise<void> {
    const confirmed = await this.messageService.confirmed('Comfimation to ' + (!this.isServerInResting ? 'run' : 'rest') + ' system', 'Enter your password to containue', 'OK', 'Cancel', 'WHITE', 'GRAY', true);
    if (confirmed.confirmed) {
      this.authService.validateCurrentPassword(confirmed.inputValue).subscribe({
        next: (data) => {
          if (data.BOOLEAN_RESPONSE) {
            this.systemService.showProgress('Trying to ' + (!this.isServerInResting ? 'run' : 'rest') + ' system...', true, true, 3);
            this.authService.restServer().subscribe({
              complete: () => {
                this.systemService.stopProgress().then((data) => {
                  if (this.isServerInResting) {
                    this.messageService.toast('info', 'System is resting now.');
                  } else {
                    this.messageService.toast('info', 'System is running now.');
                  }
                  this.refresh();
                });
              },
              error: (err) => {
                console.error(err);
                this.systemService.stopProgress('ERROR').then((data) => {
                  this.messageService.alert('Cannot rest system', '', 'INSET', 'WHITE', 'RED');
                  this.refresh();
                });
              }
            });
          } else {
            this.messageService.alert('Incorrect password', 'The password you entered is incorrect', 'OUTSET', 'WHITE', 'RED');
            this.isServerInResting = !this.isServerInResting;
          }
        },
        error: (err) => {
          console.error(err);
          this.isServerInResting = !this.isServerInResting;
        }
      });
    } else {
      this.isServerInResting = !this.isServerInResting;
    }
  }
}

import { Component, OnInit } from '@angular/core';
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
  defaultPassword: string;
  canShow: boolean;
  existsMainHR: boolean;
  isServerInResting: boolean;
  mainHR = {} as {
    name: string,
    email: string,
    staffId: string
  };
  constructor(
    private messageService: MessageDemoService,
    private authService: AuthService,
    private systemSevice: SystemService,
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
        this.defaultPassword = data.string_RESPONSE;
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

  async editDefaultPassword(): Promise<void> {
    const confirmed = await this.messageService.confirmed('Enter a new default password.', '', 'OK', 'Cancel', 'WHITE', 'GOLD', true);
    if (confirmed.confirmed) {
      this.authService.changeDefaultPassword(confirmed.inputValue).subscribe({
        next: (data) => {
          console.log('response ' + data.string_RESPONSE);
          this.defaultPassword = data.string_RESPONSE;
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
    this.systemSevice.showProgress('Adding Main HR account...', true, false, 3);
    console.log('before save ' + JSON.stringify(this.mainHR));
    this.userService.addMainHR(this.mainHR).subscribe({
      next: (data) => {
        console.log('after save ' + JSON.stringify(data));
      },
      complete: () => {
        this.systemSevice.stopProgress().then((data) => {
          this.messageService.toast('success', 'Added main HR account.');
          this.refresh();
          this.closeDialog();
        });
      },
      error: (err) => {
        this.systemSevice.stopProgress('ERROR').then((data) => {
          this.messageService.toast('error', 'An error occured when adding main HR acount.');
        });
        console.error(err);
      }
    });
  }

  closeDialog(): void {
    this.mainHR = {} as {
      name: string,
      email: string,
      staffId: string
    };
    this.canShow = false;
  }

  showDialog(): void {
    this.canShow = true;
  }

  async restServer(): Promise<void> {
    const confirmed = await this.messageService.confirmed('Comfimation to rest system', 'Enter your password to containue', 'OK', 'Cancel', 'WHITE', 'GRAY', true);

    if (confirmed.confirmed) {
      this.authService.validateCurrentPassword(confirmed.inputValue).subscribe({
        next: (data) => {
          if (data.boolean_RESPONSE) {
            this.systemSevice.showProgress('Trying to '+(this.isServerInResting?'run':'rest')+' system...', true, true, 3);
            this.authService.restServer().subscribe({
              complete: () => {
                this.systemSevice.stopProgress().then((data) => {
                  if (!this.isServerInResting) {
                    this.messageService.toast('info', 'System is resting now.');
                  } else {
                    this.messageService.toast('info', 'System is running now.');
                  }
                  this.refresh();
                });
              },
              error: (err) => {
                console.error(err);
                this.systemSevice.stopProgress('ERROR').then((data) => {
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

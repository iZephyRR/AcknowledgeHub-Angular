import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MessageDemoService } from 'src/app/services/message/message.service';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrl: './system-settings.component.scss'
})
export class SystemSettingsComponent implements OnInit {
  switch: boolean = false;
  defaultPassword: string;
  constructor(
    private messageService: MessageDemoService,
    private authService: AuthService,

  ) { }
  ngOnInit(): void {
    this.authService.getDefaultPassword().subscribe({
      next: (data) => {
        this.defaultPassword = data.string_RESPONSE;
      }
    });
  }
  onSwitch() {
    this.switch = !this.switch;
    this.messageService.toast('info', 'switched to ' + this.switch);
  }
  async editDefaultPassword(): Promise<void> {
    const confirmed = await this.messageService.confirmed('Enter a new default password.', '', 'OK', 'Cancel', 'WHITE', 'GOLD', true);
    if (confirmed.confirmed) {
      this.authService.changeDefaultPassword(confirmed.inputValue).subscribe({
        next: (data) => {
          console.log('response '+data.string_RESPONSE);
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
}

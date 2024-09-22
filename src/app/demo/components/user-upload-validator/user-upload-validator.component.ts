import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MessageDemoService } from 'src/app/services/message/message.service';
import { SystemService } from 'src/app/services/system/system.service';
import { UserUploadValidatorService } from 'src/app/services/user-upload-validator/user-upload-validator.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-user-upload-validator',
  templateUrl: './user-upload-validator.component.html',
  styleUrl: './user-upload-validator.component.scss'
})
export class UserUploadValidatorComponent {

  constructor(
    public userUploadValidator: UserUploadValidatorService,
    private userService: UserService,
    private messageService: MessageDemoService,
    private systemService: SystemService

  ) { }

  async saveData(): Promise<void> {
    if ((await this.messageService.confirmed('Are you sure to save excel data?', '', 'Sure', 'Cancel', 'WHITE', 'GREEN')).confirmed) {
      this.systemService.showProgress('Uploading users\' data', true, false, 5);
      console.log(this.userUploadValidator.users);
      this.userService.uploadExcel(this.userUploadValidator.users).subscribe({
        complete: () => {
          this.systemService.stopProgress().then(() => {
            this.messageService.toast('success', 'User excel uploaded.');
            this.userUploadValidator.showExcelImport = false;
          });
        },
        error: (err) => {
          this.systemService.stopProgress('ERROR').then(() => {
            this.messageService.toast('error', 'Failed to upload excel data.');
          });
        }
      });
    }
    else {
     // this.userUploadValidator.showExcelImport = false;
    }
  }
  cancel():void{
    this.userUploadValidator.showExcelImport = false;
  }
}

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EditDepartmentService } from 'src/app/services/edit-department/edit-department.service';
import { MessageDemoService } from 'src/app/services/message/message.service';
import { SystemService } from 'src/app/services/system/system.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-edit-department',
  templateUrl: './edit-department.component.html',
  styleUrl: './edit-department.component.scss'
})
export class EditDepartmentComponent implements OnInit {
  
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  constructor(
    public editDepartmentValidator: EditDepartmentService,
    private systemService: SystemService,
    private messageService: MessageDemoService,
    private userService: UserService
  ) { }
  ngOnInit(): void {
    this.userService.getAllByDepartmentID(this.editDepartmentValidator.department.id).subscribe({
      next: (data) => {
        this.editDepartmentValidator.insertFromApi(data);
       // this.editDepartmentValidator.users = data;
       // console.log('Requested data : '+JSON.stringify(this.editDepartmentValidator.users));
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
saveData():void{}
  // async saveData(): Promise<void> {
  //   if ((await this.messageService.confirmed('Are you sure to save this data?', '', 'Sure', 'Cancel', 'WHITE', 'GREEN')).confirmed) {
  //     this.systemService.showProgress('Uploading users\' data', true, false, 5);
  //     this.userService.uploadExcel(this.userUploadValidator.users).subscribe({
  //       complete: () => {
  //         this.systemService.stopProgress().then(() => {
  //           this.messageService.toast('success', 'User excel uploaded.');
  //           this.userUploadValidator.showExcelImport = false;
  //         });
  //       },
  //       error: (err) => {
  //         this.systemService.stopProgress('ERROR').then(() => {
  //           this.messageService.toast('error', 'Failed to upload excel data.');
  //         });
  //       }
  //     });
  //   }
  //   else {
  //    // this.userUploadValidator.showExcelImport = false;
  //   }
  // }
  uploadExcel():void{
    setTimeout(() => this.fileInput.nativeElement.click(), 0);
  }
  cancel(): void {
    this.editDepartmentValidator.showView = false;
  }
}

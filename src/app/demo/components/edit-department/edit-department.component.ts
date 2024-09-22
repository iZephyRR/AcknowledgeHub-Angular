import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Company, CompanyRequest } from 'src/app/modules/company';
import { UpdateUser, Users } from 'src/app/modules/user-excel-upload';
import { CompanyService } from 'src/app/services/company/company.service';
import { EditDepartmentService } from 'src/app/services/edit-department/edit-department.service';
import { MessageDemoService } from 'src/app/services/message/message.service';
import { SystemService } from 'src/app/services/system/system.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-edit-department',
  templateUrl: './edit-department.component.html',
  styleUrl: './edit-department.component.scss'
})
export class EditDepartmentComponent implements OnInit, OnDestroy {

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  constructor(
    public editDepartmentValidator: EditDepartmentService,
    private systemService: SystemService,
    private messageService: MessageDemoService,
    private userService: UserService,
    private companyService: CompanyService
  ) { }

  ngOnDestroy(): void {
    this.editDepartmentValidator.fieldErrors = [];
    this.editDepartmentValidator.rowErrors = [];
  }

  ngOnInit(): void {
    this.userService.getAllByDepartmentID(this.editDepartmentValidator.department.id).subscribe({
      next: (data:UpdateUser[]) => {
        this.editDepartmentValidator.insertFromApi(data);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  async saveData(): Promise<void> {
        if ((await this.messageService.confirmed('Are you sure to save this data?', '', 'Sure', 'Cancel', 'WHITE', 'GREEN')).confirmed) {
          this.systemService.showProgress('Uploading users\' data', true, true, 7);
          const users: UpdateUser[] = this.editDepartmentValidator.users.map((user) => {
            if (this.editDepartmentValidator.idContainer.has(user.staffId)) {
              user.id = this.editDepartmentValidator.idContainer.get(user.staffId).id;
              user.status = this.editDepartmentValidator.idContainer.get(user.staffId).status;
            }
            user.departmentId=this.editDepartmentValidator.department.id;
            return user;
          });
          this.userService.uploadEditExcel(users).subscribe({
            complete: () => {
              this.systemService.stopProgress().then(() => {
                this.messageService.toast('success', 'User excel uploaded.');
                this.editDepartmentValidator.showView = false;
              });
            },
            error: (err) => {
              console.error(err);
              this.systemService.stopProgress('ERROR').then(() => {
                this.messageService.toast('error', 'Failed to upload excel data.');
              });
            }
          });
        }
  }

  uploadExcel(): void {
    this.fileInput.nativeElement.click();
  }

  cancel(): void {
    this.editDepartmentValidator.showView = false;
  }


}
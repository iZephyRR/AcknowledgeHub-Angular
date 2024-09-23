import { Component } from '@angular/core';
import { HR } from 'src/app/modules/company';
import { Mail } from 'src/app/modules/mails';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { MessageDemoService } from 'src/app/services/message/message.service';
import { SystemService } from 'src/app/services/system/system.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrl: './add-company.component.scss'
})
export class AddCompanyComponent {
  HR = {} as HR;
  isModalOpen = false;  // Use this to control the modal visibility
  isFormValid = false;

  constructor(
    public companyService: CompanyService,
    private systemService: SystemService,
    private messageService: MessageDemoService,
    public authService: AuthService
  ) {

  }

  // Method to open the modal
  openModal(): void {
    this.isModalOpen = true;
  }

  // Method to close the modal
  closeModal(): void {
    this.isModalOpen = false;
  }
  addCompany(): void {
    this.systemService.showProgress('Adding '+this.HR.companyName+' company...', true, false, 7);
    this.companyService.save(this.HR).subscribe({
      complete: () => {
        this.authService.getDefaultPassword().subscribe({
          next: (data) => {
            this.messageService.sendEmail(Mail.addedMainHR(this.HR.hrEmail, this.HR.hrName, data.STRING_RESPONSE)).subscribe({
              complete: () => {
                this.systemService.stopProgress().then((data) => {
                  this.messageService.toast('success', 'Added company. ' + this.HR.companyName);
                });
                this.HR = {} as HR;
              },
              error: (err) => {
                this.systemService.stopProgress().then((data) => {
                  this.messageService.toast('error', 'Registered company and HR account but an error occured on sending email to HR.');
                });
                this.HR = {} as HR;
                console.error(err);
              }
            });
          }
        });

      },
      error: (err) => {
        this.systemService.stopProgress('ERROR').then((data) => {
          this.messageService.toast('error', 'An error occured when when adding HR account.');
        });
        console.error(err);
      }
    });
  }
  // Check form validity to enable/disable the Add button

  // Check form validity to enable/disable the Add button
  checkFormValidity(): void {
    this.isFormValid =
      !!this.HR.hrName &&
      !!this.HR.hrEmail &&
      !!this.HR.staffId &&
      !!this.HR.companyName;
  }
}

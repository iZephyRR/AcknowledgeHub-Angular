import { Component } from '@angular/core';
import { CompanyService } from 'src/app/services/company/company.service';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrl: './add-company.component.scss'
})
export class AddCompanyComponent {
  hr = {} as {
    name: string,
    email: string,
    staffId: string,
    companyName: string
  };
  isModalOpen = false;  // Use this to control the modal visibility
  isFormValid = false;

  constructor(public companyService: CompanyService) {

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
    this.companyService.save({hrName:'Ko Kaung',hrEmail:'luminhtet.mm22@gmail.com',staffId:'DAT-MAINHR',companyName:'DAT'}).subscribe();
  }
  // Check form validity to enable/disable the Add button
 
  // Check form validity to enable/disable the Add button
  checkFormValidity(): void {
    this.isFormValid =
      !!this.hr.name &&
      !!this.hr.email &&
      !!this.hr.staffId &&
      !!this.hr.companyName;
  }
}

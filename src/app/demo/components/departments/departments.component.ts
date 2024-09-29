import { Component, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Company } from 'src/app/modules/company';
import { Department } from 'src/app/modules/department';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import { EditDepartmentService } from 'src/app/services/edit-department/edit-department.service';
import { MessageDemoService } from 'src/app/services/message/message.service';
import { UserUploadValidatorService } from 'src/app/services/user-upload-validator/user-upload-validator.service';



@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.scss'
})

export class DepartmentsComponent implements OnInit, OnDestroy {
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  departments: Department[] = [];
  company: Company={}as Company;
  private routerSubscription: Subscription;
  constructor(
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private messageService: MessageDemoService,
    public userUploadValidator: UserUploadValidatorService,
    private authService:AuthService,
    private editDepartmentService:EditDepartmentService
  ) {

  }

  ngOnInit(): void {
    this.loadDepartments();
    this.routerSubscription = this.router.events.subscribe(async event => {
      if (event instanceof NavigationEnd) {
        if (this.userUploadValidator.showExcelImport) {
          if ((await this.messageService.confirmed('Are you sure to cancel uploading user.', '', 'OK', 'Cancel', 'WHITE', 'GRAY')).confirmed) {
            this.userUploadValidator.showExcelImport = false;
            this.loadDepartments();
          }
        } else {
          this.loadDepartments();
        }
      }
    });
  }
  loadDepartments(): void {
    const companyId:number=Number.parseInt(this.route.snapshot.paramMap.get('id'));
    this.companyService.getDTOById(Number.isNaN(companyId)?this.authService.companyId:companyId).subscribe({
      next: (companyData) => {
        this.company = companyData;
      },

      complete: () => {
        this.departmentService.getAllByCompany(this.company.id).subscribe({
          next: (departmentData) => {
            console.log(JSON.stringify(departmentData));
            this.departments = departmentData;
          },
          error: (err) => {
            this.router.navigate(['/company']);
            console.error(err);
          }
        });
      },

      error: (err) => {
        this.router.navigate(['/company']);
        console.error(err);
      }
    });
  }

  getEmployees(id: number) {
    this.router.navigate([`/department/${id}`]);
  }

  async addDepartment(): Promise<void> {
    const confirmed = await this.messageService.confirmed('Add Department', 'Enter new department name', 'OK', 'Cancel', 'WHITE', 'BLACK', true);
    if (confirmed.confirmed) {
      this.userUploadValidator.company = this.company;
      this.userUploadValidator.departmentName = confirmed.inputValue;
      setTimeout(() => this.fileInput.nativeElement.click(), 0);
      // this.showExcelImport = true;
    }
  }
  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async editName(): Promise<void> {
    const confirmed = await this.messageService.confirmed('Update company name', 'Enter company name', 'Save', 'Cancel', 'WHITE', 'DARKGREEN', true);
    if (confirmed.confirmed) {
      this.companyService.editCompany({ id: this.company.id, name: confirmed.inputValue }).subscribe({
        complete: () => {

          this.loadDepartments();
          this.messageService.toast('info', 'Saved company name.')
        },
        error: (err) => {
          this.messageService.toast('error', 'An error occured on saving company name.');
          console.error(err);
        }
      });
    }
  }

}

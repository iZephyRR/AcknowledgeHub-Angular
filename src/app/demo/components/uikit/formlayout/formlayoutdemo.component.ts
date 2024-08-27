import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';

import { AnnouncementTarget } from 'src/app/modules/announcement-target';
import { Department } from 'src/app/modules/department';
import { CompanyService } from 'src/app/services/company/company.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import { Category } from 'src/app/modules/category';
import { CategoryService } from 'src/app/services/category/category.service';
import { NgForm } from '@angular/forms';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import { MessageDemoService } from 'src/app/services/message/message.service';
import { catchError, map, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Company } from 'src/app/modules/company';
import { NotificationService } from 'src/app/services/notifications/notification service';
import { SystemService } from 'src/app/services/system/system.service';



@Component({
  selector: 'app-form-layout-demo',
  templateUrl: './formlayoutdemo.component.html',
})
export class FormLayoutDemoComponent implements OnInit {
  categories: Category[] = [];
  departments: Department[] = [];
  companies: any[] = [];
  target: AnnouncementTarget;

  title: string = '';
  selectedCategory: any;
  showDatePicker: boolean = false;
  scheduleOption: string = 'now';
  scheduleDate: Date = new Date();
  filePreview: string | ArrayBuffer | null = null;
  filename: string = '';
  file: File;
  //fileType?: string;
  selectedTargets: TreeNode[] = [];
  treeNodes: any[] = [];
  role: string;
  companyId: number;

  constructor(
    private announcementService: AnnouncementService,
    private companyService: CompanyService,
    private categoryService: CategoryService,
    private messageService: MessageDemoService,
    private authService: AuthService,
    private systemService: SystemService
  ) { }

  onScheduleOptionChange() {
    if (this.scheduleOption === 'later') {
      this.showDatePicker = true;  // Show date picker if 'later' is selected
    } else {
      this.showDatePicker = false; // Hide date picker if 'now' is selected
      this.scheduleDate = new Date(); // Reset to current date for 'now' option
    }
  }

  ngOnInit() {
    this.role = this.authService.role;
    this.companyId = this.authService.companyId;
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
    });

    if (this.role === "HR" || this.role === "HR_ASSISTANCE") {
      this.getCompanyById(this.companyId);
    } else {
      this.getAllCompanies();
    }
  }

  getAllCompanies(): void {
    this.companyService.getAllCompanies().subscribe(data => {
      this.companies = data.map(company => this.mapCompanyToTreeNode(company));
    }, error => {
      console.error('Error fetching companies data:', error);
    });
  }

  getCompanyById(companyId: number): void {
    this.companyService.getCompanyById(companyId).pipe(
      map((company) => this.mapCompanyToTreeNode(company))
    ).subscribe(
      (treeNode) => {
        this.companies = [treeNode];
      },
      (error) => {
        console.error('Error fetching company data:', error);
      }
    );
  }

  private mapCompanyToTreeNode(company: Company): TreeNode<any> {
    return {
      label: company.name,
      data: {
        ...company,
        type: "COMPANY"
      },
      expanded: false,
      children: company.departments.map(department => ({
        label: department.name,
        data: {
          ...department,
          companyId: company.id,
          type: "DEPARTMENT"
        }
      }))
    } as TreeNode<any>;
  }

  toggleDatePicker(show: boolean): void {
    this.showDatePicker = show;
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('pdf-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onSubmit(form: NgForm): void {
    // this.scheduleDate = this.scheduleOption === 'later' ? this.scheduleDate : new Date();
    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('categoryId', this.selectedCategory);
    formData.append('file', this.file);
    formData.append('filename', this.filename);
    if (this.scheduleOption === 'later') {
      // Adjust the date for the correct time zone if necessary
      const offset = new Date().getTimezoneOffset(); // Get the time zone offset in minutes
      const correctedDate = new Date(this.scheduleDate.getTime() - offset * 60000);
      console.log("scheduleOption : later " + correctedDate.toISOString());
      formData.append('scheduleOption', 'later');
      formData.append('createdAt', correctedDate.toISOString()); // Use corrected date
    } else {
      // Adjust the current date for the correct time zone if necessary
      const now = new Date();
      const offset = now.getTimezoneOffset(); // Get the time zone offset in minutes
      const correctedNow = new Date(now.getTime() - offset * 60000);
      console.log("scheduleOption : now " + correctedNow.toISOString());
      formData.append('scheduleOption', 'now');
      formData.append('createdAt', correctedNow.toISOString()); // Use corrected current date
    }

    const selectedCompanyIds = this.selectedTargets
      .filter(target => target.data.type === "COMPANY")
      .map(target => target.data.id);

    const targetData = this.selectedTargets
      .filter(target => {
        if (target.data.type === "COMPANY") {
          return true; // Always include the company
        }

        if (target.data.type === "DEPARTMENT") {
          const parentCompanyId = target.data.companyId;
          // Exclude the department if its parent company is selected
          return !selectedCompanyIds.includes(parentCompanyId);
        }
        return false; // Exclude any other type (safety net)
      })
      .map(target => ({
        sendTo: target.data.id,
        receiverType: target.data.type
      }));

    console.log("Final Target Data:", targetData);
    const targetJSON = JSON.stringify(targetData);
    formData.append('target', targetJSON);

    this.announcementService.createAnnouncement(formData).pipe(
      catchError(error => {
        console.log('error status ' + error.status);
        return throwError(error);
      })
    ).subscribe(
      {
        complete: () => {
          this.messageService.message("success", "Announcement Created");
          this.resetForm(form);
          this.clearPreview();
        }, error: (err) => {
          this.messageService.message("error", "Can't Create");
        }
      }
    );
  }
  //       response => {

  //         this.messageService.message("success", "Announcement Created");
  //         this.resetForm(form);
  //         this.clearPreview();
  //       },
  //       error => {
  // console.log('error status : '+error.status);
  //         this.messageService.message("error", "Can't Create");
  //       }


  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.file = file;
      this.filename = file.name;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  clearPreview(): void {
    this.filePreview = undefined;
    this.filename = undefined;
  }

  resetForm(form: NgForm) {
    form.reset();
    this.selectedTargets = [];
    this.showDatePicker = false;  // Hide the date picker
    this.scheduleOption = 'now';  // Reset schedule option to 'now'
    this.scheduleDate = new Date(); // Reset the schedule date
  }

  isImage(): boolean {
    return this.filename?.match(/\.(jpg|jpeg|png|gif)$/i) !== null;
  }

  isVideo(): boolean {
    return this.filename?.match(/\.(mp4|webm|ogg)$/i) !== null;
  }

  isAudio(): boolean {
    return this.filename?.match(/\.(mp3|wav|ogg)$/i) !== null;
  }
}

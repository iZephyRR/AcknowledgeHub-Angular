import { Component, OnInit, signal } from '@angular/core';
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
import { CustomTargetGroupService } from 'src/app/services/custom-target-group/custom-target-group.service';
import { CustomTergetGroup } from 'src/app/modules/custom-target-group';
import { SystemService } from 'src/app/services/system/system.service';
import { MaptotreeService } from 'src/app/services/mapToTree/maptotree.service';

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
  selectedTargets:TreeNode[]=[];
  treeNodes: any[] = [];
  role: string;
  companyId: number;

  constructor(
    private announcementService: AnnouncementService,
    private companyService: CompanyService,
    private categoryService: CategoryService,
    private messageService: MessageDemoService,
    private authService: AuthService,
    private customTargetGroupService: CustomTargetGroupService,
    private systemService: SystemService,
    private maptotreeService : MaptotreeService
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
    this.loadCategories();

    if (this.role === 'HR' || this.role === 'HR_ASSISTANCE') {
      this.getCompanyById(this.companyId);
    } else {
      this.getAllCompanies();
    }
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
    });
  }

  getAllCompanies(): void {
    this.companyService.getAllCompanies().subscribe(
      data => {
        this.companies = data.map(company => this.maptotreeService.mapCompanyToTreeNode(company));
      },
      error => {
        console.error('Error fetching companies data:', error);
      }
    );
  }

  getCompanyById(companyId: number): void {
    this.companyService
      .getCompanyById(companyId)
      .pipe(map(company => this.maptotreeService.mapCompanyToTreeNode(company)))
      .subscribe(
        treeNode => {
          this.companies = [treeNode];
        },
        error => {
          console.error('Error fetching company data:', error);
        }
      );
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
// on submit
onSubmit(form: NgForm): void {
    const formData = this.prepareFormData();
    this.announcementService.createAnnouncement(formData).pipe(
      catchError(error => {
        console.error('Error status:', error.status);
        this.messageService.toast("error", "Can't Create");
        return throwError(error);
      })
    ).subscribe({
      complete: () => {
        this.messageService.toast("success", "Announcement Created");
        this.resetForm(form);
        this.clearPreview();
      }
    });
  }

  // save to draft
  saveToDraft(form: NgForm): void {
    console.log("in save to draft");
    const formData = this.prepareFormData();
    const formDataObj = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        formDataObj[key] = value.name; // Save just the filename
      } else {
        formDataObj[key] = value;
      }
    });
    this.announcementService.saveDraft(formData).pipe(
      catchError(error => {
        console.log('error status ' + error.status);
        return throwError(error);
      })
    ).subscribe(
      {
        complete: () => {
          this.messageService.toast("success", "Announcement Saved");
          this.resetForm(form);
          this.clearPreview();
        },
        error :(err) =>{
          this.messageService.toast("error", "Can't Save");
        }
      }
    );
  }

  prepareFormData(): FormData {
    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('categoryId', this.selectedCategory);
    formData.append('file', this.file);
    formData.append('filename', this.filename);
    if (this.scheduleOption === 'later') {
      const offset = new Date().getTimezoneOffset(); // Get the time zone offset in minutes
      const correctedDate = new Date(this.scheduleDate.getTime() - offset * 60000);
      console.log("scheduleOption : later " + correctedDate.toISOString());
      formData.append('scheduleOption', 'later');
      formData.append('createdAt', correctedDate.toISOString()); // Use corrected date
    } else {
      const now = new Date();
      const offset = now.getTimezoneOffset(); // Get the time zone offset in minutes
      const correctedNow = new Date(now.getTime() - offset * 60000);
      console.log("scheduleOption : now " + correctedNow.toISOString());
      formData.append('scheduleOption', 'now');
      formData.append('createdAt', correctedNow.toISOString()); // Use corrected current date
    }
    const targetJSON = JSON.stringify(this.targetData);
    formData.append('target', targetJSON);

    return formData;
  }

  get targetData(): AnnouncementTarget[] {
    const selectedCompanyIds: number[] = this.selectedTargets
      .filter(target => target.data.type === "COMPANY")
      .map(target => target.data.id);

    const targetData: AnnouncementTarget[] = this.selectedTargets
      .filter(target => {
        if (target.data.type === "COMPANY") {
          return true;
        }
        if (target.data.type === "DEPARTMENT") {
          const parentCompanyId: number = target.data.companyId;
          return !selectedCompanyIds.includes(parentCompanyId);
        }
        return false;
      })
      .map(target => ({
        sendTo: target.data.id,
        receiverType: target.data.type
      }));

    return targetData;
  }
  async saveTarget(): Promise<void> {
    const confirmed = await this.messageService.confirmed('Save custom target group', 'Enter a title', 'Save', 'Cancel', 'WHITE', 'GREEN', true);
    if (confirmed.confirmed) {
      this.systemService.showProgress('Saving custom target...', true, false, 3);
      const title: string = confirmed.inputValue;
      this.customTargetGroupService.save({ title: title, customTargetGroupEntities: this.targetData }).subscribe({
        next: () => {
          this.systemService.stopProgress().then(() => {
            this.messageService.toast('success', 'Saved a custom target.');
          });
        },
        error: (err) => {
          console.error(err);
          this.systemService.stopProgress('ERROR').then(() => {
            this.messageService.toast('error', 'An unknown error occured, please contect to IT Support.');
          });
        }
      });
    }

  }

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
    this.selectedTargets= null;
  }

  resetForm(form: NgForm) {
    form.resetForm();
    this.selectedTargets = [];
    this.selectedCategory = null;
    this.loadCategories(); // Refresh categories
    this.getAllCompanies(); // Refresh targets (companies)
    this.clearPreview();
    this.showDatePicker = false;
    this.scheduleOption = 'now';
    this.scheduleDate = new Date();
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
  saveDraft(): void {
    console.log('Draft saved');
    // Additional logic to save the draft
  }
}

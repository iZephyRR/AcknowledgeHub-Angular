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
    private systemService: SystemService
  ) { }

  private mapTargetsToTreeNodes(targets: AnnouncementTarget[], companies: TreeNode<any>[]): TreeNode<any>[] {
    const selectedNodes: TreeNode<any>[] = [];

    if (!Array.isArray(targets) || !Array.isArray(companies)) {
      console.error("Invalid input data. Targets or Companies is not an array.");
      return selectedNodes;
    }

    targets.forEach(target => {
      companies.forEach(companyNode => {
        if (target.receiverType === "COMPANY" && target.sendTo === companyNode.data.id) {
            selectedNodes.push(companyNode);
            companyNode.children?.forEach(departmentNode => {
              selectedNodes.push(departmentNode);
            });
        }
        
        companyNode.children?.forEach(departmentNode => {
          if (target.receiverType == "DEPARTMENT" && target.sendTo === departmentNode.data.id) {
              selectedNodes.push(departmentNode);
            }
        });
      });
    });
    return selectedNodes;
  }

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

    formData.append('target', JSON.stringify(this.targetData));

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

  get targetData(): AnnouncementTarget[] {
    const selectedCompanyIds: number[] = this.selectedTargets
      .filter(target => target.data.type === "COMPANY")
      .map(target => target.data.id);

    const targetData: AnnouncementTarget[] = this.selectedTargets
      .filter(target => {
        if (target.data.type === "COMPANY") {
          return true; // Always include the company
        }

        if (target.data.type === "DEPARTMENT") {
          const parentCompanyId: number = target.data.companyId;
          // Exclude the department if its parent company is selected
          return !selectedCompanyIds.includes(parentCompanyId);
        }
        return false; // Exclude any other type (safety net)
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
    this.selectedTargets=[];
    this.showDatePicker = false;  // Hide the date picker
    this.scheduleOption = 'now';  // Reset schedule option to 'now'
    this.scheduleDate = new Date(); // Reset the schedule date
  }

  test(): void {
    this.customTargetGroupService.findAll().subscribe({
      next: (data) => {
        console.log(JSON.stringify(data));
        console.log('data 1 '+JSON.stringify(data[1].customTargetGroupEntities))
        this.selectedTargets=this.mapTargetsToTreeNodes(data[1].customTargetGroupEntities,this.selectedTargets);
      },
      error: (err) => {
        console.error(err);
      }
    });
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

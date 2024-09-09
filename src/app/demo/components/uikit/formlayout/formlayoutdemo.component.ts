import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { UserService } from 'src/app/services/user/user.service';
import { CustomTargetGroupService } from 'src/app/services/custom-target-group/custom-target-group.service';
import { SystemService } from 'src/app/services/system/system.service';
import { MaptotreeService } from 'src/app/services/mapToTree/maptotree.service';
import { User } from 'src/app/modules/user';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-form-layout-demo',
  templateUrl: './formlayoutdemo.component.html',
})
export class FormLayoutDemoComponent implements OnInit {

  groups: any[] = [
    { id: 'group1', name: 'Group 1' },
    { id: 'group2', name: 'Group 2' },
    { id: 'group3', name: 'Group 3' },
    { id: 'group4', name: 'Group 4' },
  ];

  selectedGroup: string | null = null;
  categories: Category[] = [];
  departments: Department[] = [];
  companies: TreeNode[] = [];
  target: AnnouncementTarget;
  title: string = '';
  selectedCategory: string;
  showDatePicker: boolean = false;
  scheduleOption: string = 'now';
  scheduleDate: Date = new Date();
  filePreview: string | ArrayBuffer | null = null;
  filename: string = '';
  file: File;
  selectedTargets: TreeNode[] = [];
  treeNodes: any[] = [];
  role: string;
  companyId: number;
  showEmployeeModal: boolean = false;
  users: User[] = [];
  selectedUser?: User;
  loading: boolean = false;
  filter: string = ''; // Updated to string for search functionality
  displayByOneEmployeeDialog: boolean;
  selectedChannels: string[] = ['telegram'];
  channels: any;
  selectedEmployees: any[] = [];
  viewOption: 'tree' | 'table' = 'tree'; // Default to 'tree'
  selectAllCompanies : boolean;

  constructor(
    private announcementService: AnnouncementService,
    private companyService: CompanyService,
    private categoryService: CategoryService,
    private messageService: MessageDemoService,
    private authService: AuthService,
    private customTargetGroupService: CustomTargetGroupService,
    private systemService: SystemService,
    private maptotreeService: MaptotreeService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.role = this.authService.role;
    this.companyId = this.authService.companyId;
    this.loadCategories();

    if (this.role === "HR" || this.role === "HR_ASSISTANCE") {
      this.getCompanyById();
      this.retrieveAllUsersByConpanyId();
    } else {
      this.getAllCompanies();
      this.retrieveAllUsers();
    }
  }

  onViewChange(option: 'tree' | 'table') {
    this.viewOption = option;
    // if (this.viewOption == 'tree') {
    //   this.selectedEmployees = [];
    // } else {
    //   this.selectedTargets = [];
    // }
  }

  retrieveAllUsers(): void {
    this.userService.getAllUsers().subscribe(data => {
      this.users = data;
    });
  }

  retrieveAllUsersByConpanyId(): void {
    this.userService.getUsersByCompany().subscribe(data => {
      this.users = data;
    });
  }

  showDetails(user: User): void {
    this.selectedUser = user;
  }

  closeDetails(): void {
    this.selectedUser = undefined;
  }

  onGlobalFilter(table: Table, event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(filterValue, 'contains');
  }

  toggleByOneEmployeeDialog(): void {
    this.displayByOneEmployeeDialog = !this.displayByOneEmployeeDialog;
  }

  clear(table: Table): void {
    table.clear();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
    });
  }

  getAllCompanies(): void {
    this.companyService.getAllCompanies().subscribe(
      data => {
        const mappedTree = this.maptotreeService.mapAllCompaniesToTree(data);
        this.companies = [mappedTree];
      },
      error => {
        console.error('Error fetching companies data:', error);
      }
    );
  }

  getCompanyById(): void {
    this.companyService.getCompanyById().pipe(
      map((company) => this.maptotreeService.mapCompanyToTreeNode(company))
    ).subscribe(
      (treeNode) => {
        this.companies = [treeNode];
      },
      error => {
        console.error('Error fetching companies data:', error);
      }
    );
  }

  onScheduleOptionChange(): void {
    this.showDatePicker = this.scheduleOption === 'later';
    if (this.scheduleOption === 'now') {
      this.scheduleDate = new Date();
    }
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
    //this.systemService.showProgress('Processing...',true,false,300);
    const formData = this.prepareFormData();
    this.announcementService.createAnnouncement(formData).pipe(
      catchError(error => {
        console.error('Error status:', error.status);
        return throwError(error);
      })
    ).subscribe({
      complete: () => {
        this.messageService.toast("success", "Announcement Created");
    //    this.messageService.sentWindowNotification("New Announcement Create",{body:'Accouncement Created by blahahahah',icon:'assets\\demo\\images\\avatar\\amyelsner.png'});
       this.resetForm(form);
        this.clearPreview();
      },
      error: () => {
        this.messageService.toast("error", "Can't Create");
      }
    });
  }

  saveToDraft(form: NgForm): void {
    console.log("Saving to draft...");
    const formData = this.prepareFormData();
    this.announcementService.saveDraft(formData).pipe(
      catchError(error => {
        console.error('Error status:', error.status);
        return throwError(error);
      })
    ).subscribe({
      complete: () => {
        this.messageService.toast("success", "Announcement Saved");
        this.resetForm(form);
        this.clearPreview();
      },
      error: () => {
        this.messageService.toast("error", "Can't Save");
      }
    });
  }

  prepareFormData(): FormData {
    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('categoryId', this.selectedCategory);
    formData.append('file', this.file);
    formData.append('filename', this.filename);

    const offset = new Date().getTimezoneOffset();
    if (this.scheduleOption === 'later') {
      const correctedDate = new Date(new Date(this.scheduleDate).getTime() - offset * 60000);
      formData.append('scheduleOption', 'later');
      formData.append('createdAt', correctedDate.toISOString());
    } else {
      const correctedNow = new Date(new Date().getTime() - offset * 60000);
      formData.append('scheduleOption', 'now');
      formData.append('createdAt', correctedNow.toISOString());
    }
    console.log("channel : ", JSON.stringify(this.selectedChannels));
    formData.append("channel", JSON.stringify(this.selectedChannels));
    console.log("target : ", this.targetData);
    formData.append('target', JSON.stringify(this.targetData));
    console.log("select all companies : ", this.selectAllCompanies);
    formData.append('selectAll', JSON.stringify(this.selectAllCompanies));
    return formData;
  }

  get targetData(): AnnouncementTarget[] {
    let targets: AnnouncementTarget[] = [];
    this.selectAllCompanies = false;
    if (this.selectedTargets.length > 0) {
      const selectedCompanyIds: number[] = this.selectedTargets
        .filter(target => target.data.type === 'COMPANY')
        .map(target => target.data.id);
      targets = this.selectedTargets
        .filter(target => {
          if (target.data.type === 'COMPANY') {
            return true;
          }
          if (target.data.type === 'DEPARTMENT') {
            const parentCompanyId: number = target.data.companyId;
            return !selectedCompanyIds.includes(parentCompanyId);
          }
          return false;
        })
        .map(target => ({
          sendTo: target.data.id,
          receiverType: target.data.type as 'COMPANY' | 'DEPARTMENT'
        }));
        if (this.selectedTargets.some(target => target.data.type === 'ALL COMPANIES')) {
          this.selectAllCompanies = true;
        }
    }
    if (this.selectedEmployees.length > 0) {
      const employeeTargets = this.selectedEmployees.map(employee => ({
        sendTo: employee.id,
        receiverType: 'EMPLOYEE' as 'EMPLOYEE'
      }));
  
      targets = [...targets, ...employeeTargets];  // Append employees
    }
    return targets;
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
            this.messageService.toast('error', 'An unknown error occurred, please contact IT support.');
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
    this.filePreview = null;
    this.filename = '';
  }

  resetForm(form: NgForm): void {
    form.reset();
    this.selectedChannels = ['telegram'];
    this.clearPreview();
    this.selectedCategory = '';
    this.scheduleOption = 'now';
    this.showDatePicker = false;
    this.title = '';
    this.file = null;
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

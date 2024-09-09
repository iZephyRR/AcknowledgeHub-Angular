import { Component, OnInit, signal } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { Table } from 'primeng/table';
import { catchError, map, throwError } from 'rxjs';
import { AnnouncementTarget } from 'src/app/modules/announcement-target';
import { Category } from 'src/app/modules/category';
import { Company } from 'src/app/modules/company';
import { Draft } from 'src/app/modules/draft';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CategoryService } from 'src/app/services/category/category.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { MaptotreeService } from 'src/app/services/mapToTree/maptotree.service';
import { MessageDemoService } from 'src/app/services/message/message.service';
import { SystemService } from 'src/app/services/system/system.service';

@Component({
  templateUrl: './overlaysdemo.component.html',
  providers: [ConfirmationService, MessageService]
})
export class OverlaysDemoComponent implements OnInit {

  drafts = signal([] as Draft[]);
  displayModal: boolean = false;

  file: File;
  categories: Category[] = [];
  companies = []; // Assuming you have this data structure
  selectedCategory: any;
  title: string = '';
  scheduleOption: string = '';
  showDatePicker: boolean = false;
  scheduleDate: Date = new Date();;
  selectedTargets: any[] = [];
  filePreview: string | ArrayBuffer | null = null;
  filename: string = '';
  role: string;
  draft: Draft;
  draftId: number;
  fileUrl : string;
  selectAllCompanies : boolean;
  selectedChannels: any[] = ['telegram'];

  constructor(
    private announcementService: AnnouncementService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private companyService: CompanyService,
    private messageService: MessageDemoService,
    private systemService: SystemService,
    private mapToTreeService: MaptotreeService
  ) { }

  ngOnInit() {
    this.loadDrafts();
    this.role = this.authService.role;
    if (this.role === "HR" || this.role === "HR_ASSISTANCE") {
      this.getCompanyById();
    } else {
      this.getAllCompanies();
    }
  }

  loadDrafts() {
    this.announcementService.getDrafts().subscribe(data => {
      this.drafts.set(data);
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(filterValue, 'contains');
  }

  showModal(draftId: number) {
    this.displayModal = true;
    this.draftId = draftId;
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
    });

    this.announcementService.getDraftById(draftId).subscribe({
      next: (response) => {
        this.draft = response;
        console.log("draft announcement : " + JSON.stringify(this.draft.target));
        this.selectedCategory = this.draft.categoryId;
        this.title = this.draft.title;
        this.filePreview = this.draft.filename;
        this.filename = this.draft.filename;
        this.fileUrl = this.draft.fileUrl;
        // Map target to tree nodes
        if (typeof this.draft.target == 'string') {
          this.draft.target = JSON.parse(this.draft.target);
        }
        this.selectedTargets = this.mapToTreeService.mapTargetsToTreeNodes(this.draft.target, this.companies);
      },
      error: (err) => {
        console.error("Error fetching draft:", err);
      }
    });
  }

  getAllCompanies(): void {
    this.companyService.getAllCompanies().subscribe(
      data => {
        const mappedTree = this.mapToTreeService.mapAllCompaniesToTree(data);
        this.companies = [mappedTree];
      },
      error => {
        console.error('Error fetching companies data:', error);
      }
    );
  }

  getCompanyById(): void {
    this.companyService.getCompanyById().pipe(
      map((company) => this.mapToTreeService.mapCompanyToTreeNode(company))
    ).subscribe(
      (treeNode) => {
        this.companies = [treeNode];
      },
      (error) => {
        console.error('Error fetching company data:', error);
      }
    );
  }

  hideModal() {
    this.displayModal = false;
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

  toggleDatePicker(show: boolean) {
    this.showDatePicker = show;
  }

  clearPreview(): void {
    this.filePreview = undefined;
    this.filename = undefined;
    this.selectedTargets = null;
    this.selectedChannels = [];
  }

  onSubmit(form: NgForm) {
    //this.systemService.showLoading('Processing...');
    const formData = this.prepareFormData();
    this.announcementService.createAnnouncement(formData).pipe(
      catchError(error => {
        console.log('error status ' + error.status);
        return throwError(error);
      })
    ).subscribe(
      {
        complete: () => {
          this.messageService.toast("success", "Announcement Created");
          this.resetForm(form);
          this.clearPreview();
          this.systemService.hideLoading();
          this.hideModal();
          this.deleteDraft(this.draftId);
        },
        error: (err) => {
          this.messageService.toast("error", "Can't Create");
        }
      }
    );
  }

  prepareFormData(): FormData {
    const formData = new FormData();
    //formData.append('draftId', this.draftId.toString());
    formData.append('title', this.title);
    formData.append('categoryId', this.selectedCategory);
    if (this.file) {
      formData.append('file', this.file);
    }
    formData.append('filename', this.filename);
    if (this.scheduleOption === 'later') {
      const offset = new Date().getTimezoneOffset(); // Get the time zone offset in minutes
      const correctedDate = new Date(new Date(this.scheduleDate).getTime() - offset * 60000);
      console.log("scheduleOption : later " + correctedDate.toISOString());
      formData.append('scheduleOption', 'later');
      formData.append('createdAt', correctedDate.toISOString()); // Use corrected date
    } else {
      const now = new Date();
      const offset = now.getTimezoneOffset();
      const correctedNow = new Date(now.getTime() - offset * 60000);
      console.log("scheduleOption : now " + correctedNow.toISOString());
      formData.append('scheduleOption', 'now');
      formData.append('createdAt', correctedNow.toISOString()); // Use corrected current date
    }
    formData.append("channel", JSON.stringify(this.selectedChannels));
    console.log("targets : ", JSON.stringify(this.targetData));
    formData.append('target', JSON.stringify(this.targetData));
    console.log("file url : ", this.fileUrl);
    formData.append('fileUrl',this.fileUrl);
    formData.append('selectAll', JSON.stringify(this.selectAllCompanies));
    formData.append('channel',JSON.stringify(this.selectedChannels));
    return formData;
  }

  get targetData(): AnnouncementTarget[] {
    this.selectAllCompanies = false;
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
        receiverType: target.data.type as 'COMPANY' | 'DEPARTMENT'
      }));
      if (this.selectedTargets.some(target => target.data.type === 'ALL COMPANIES')) {
        this.selectAllCompanies = true;
      }
    return targetData;
  }

  deleteDraft(id : number){
    this.announcementService.deleteDraft(id).subscribe({
      next: (response) => {
        this.messageService.toast('success', 'Delete Success');
        this.loadDrafts();
      },
      error: (error) => {
        this.messageService.toast('error', "Can't delete");
      }
    });
  } 

  async delete(id: number) {
    if (await this.messageService.confirmed('Delete Confirmation', 'Are you sure to delete?', 'Yes', 'No', 'WHITE', 'BLACK')) {
      this.deleteDraft(id);
    }
  }

  onScheduleOptionChange() {
    if (this.scheduleOption === 'later') {
      this.showDatePicker = true;  // Show date picker if 'later' is selected
    } else {
      this.showDatePicker = false; // Hide date picker if 'now' is selected
      this.scheduleDate = new Date(); // Reset to current date for 'now' option
    }
  }

  resetForm(form: NgForm) {
    form.reset();
    this.selectedTargets = [];
    this.showDatePicker = false;  // Hide the date picker
    this.scheduleOption = 'now';  // Reset schedule option to 'now'
    this.scheduleDate = new Date(); // Reset the schedule date
  }

  isImage(): boolean {
    return this.filePreview && typeof this.filePreview === 'string' && this.filePreview.startsWith('data:image');
  }

  isVideo(): boolean {
    return this.filePreview && typeof this.filePreview === 'string' && this.filePreview.startsWith('data:video');
  }

  isAudio(): boolean {
    return this.filePreview && typeof this.filePreview === 'string' && this.filePreview.startsWith('data:audio');
  }
}

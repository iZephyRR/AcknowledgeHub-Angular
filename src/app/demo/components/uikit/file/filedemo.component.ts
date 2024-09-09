import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { AnnouncementTarget } from 'src/app/modules/announcement-target';
import { CompanyService } from 'src/app/services/company/company.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CustomTargetGroupService } from 'src/app/services/custom-target-group/custom-target-group.service';
import { MessageDemoService } from 'src/app/services/message/message.service';
import { SystemService } from 'src/app/services/system/system.service';
import { MaptotreeService } from 'src/app/services/mapToTree/maptotree.service';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-file-demo',
  templateUrl: './filedemo.component.html',
})
export class FileDemoComponent implements OnInit {

  selectedTargets: TreeNode[] = [];
  overviewSelectedTargets: TreeNode[] = [];
  companies: TreeNode[] = [];
  role: string;
  companyId: number;
  expandedRows: { [key: string]: boolean } = {}; // Property for managing expanded rows
  //isExpanded: boolean = false;
  expandedTarget: any = null; // Property to track if all rows are expanded or collapsed
  displayModal: boolean = false; // Property to control modal visibility
  //expandedRowIds = new Set<number>();
  expandedRowKeys: { [key: string]: boolean } = {};

  constructor(
    private companyService: CompanyService,
    private authService: AuthService,
    private customTargetGroupService: CustomTargetGroupService,
    private messageService: MessageDemoService,
    private systemService: SystemService,
    private maptotreeService: MaptotreeService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.role = this.authService.role;
    this.companyId = this.authService.companyId;
    if (this.role === 'HR' || this.role === 'HR_ASSISTANCE') {
      this.getCompanyById();
    } else {
      this.getAllCompanies();
    }
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  getAllCompanies(): void {
    this.companyService.getAllCompanies().subscribe(
      (data) => {
        this.companies = data.map((company) =>
          this.maptotreeService.mapCompaniesToNodesWithEmployees(company)
        );
        console.log('Mapped TreeNode Structure:', this.companies);
      },
      (error) => {
        console.error('Error fetching companies data:', error);
      }
    );
  }

  getCompanyById(): void {
    this.companyService
      .getCompanyById()
      .pipe(map((company) => this.maptotreeService.mapCompaniesToNodesWithEmployees(company)))
      .subscribe(
        (treeNode) => {
          this.companies = [treeNode];
        },
        (error) => {
          console.error('Error fetching company data:', error);
        }
      );
  }

  updateSelectedTargets(node: TreeNode<any>, isSelected: boolean): void {
    if (isSelected) {
      if (!this.overviewSelectedTargets.find(t => t.data.id === node.data.id)) {
        this.overviewSelectedTargets.push(node);
      }
    } else {
      this.overviewSelectedTargets = this.overviewSelectedTargets.filter(t => t.data.id !== node.data.id);
      if (node.children) {
        node.children.forEach(child => {
          this.overviewSelectedTargets = this.overviewSelectedTargets.filter(t => t.data.id !== child.data.id);
        });
      }
    }
    this.overviewSelectedTargets = this.overViewTarget;
  }

  onRowToggle(target: any) {
    const id = target.data.id;
    if (this.expandedRowKeys[id]) {
      delete this.expandedRowKeys[id]; // Collapse the row if it's already expanded
    } else {
      this.expandedRowKeys = {}; // Ensure only one row is expanded at a time
      this.expandedRowKeys[id] = true; // Expand the current row
    }
  }

  get overViewTarget(): TreeNode[] {
    const selectedCompanyIds: number[] = this.selectedTargets
      .filter((target) => target.data.type === 'COMPANY')
      .map((target) => target.data.id);

    const selectedDepartmentIds: number[] = this.selectedTargets
      .filter((target) => target.data.type === 'DEPARTMENT')
      .map((target) => target.data.id);

    const targetNodes: TreeNode[] = this.selectedTargets
      .filter((target) => {
        if (target.data.type === 'COMPANY') {
          return true; // Always include the company
        }
        if (target.data.type === 'DEPARTMENT') {
          const parentCompanyId: number = target.data.companyId;
          return !selectedCompanyIds.includes(parentCompanyId);
        }
        if (target.data.type === 'EMPLOYEE') {
          const parentDepartmentId: number = target.data.departmentId;
          return !selectedDepartmentIds.includes(parentDepartmentId);
        }
        return false;
      })
      .map((target) => ({
        ...target,
        children: target.children ? target.children.map(child => ({
          ...child
        })) : [],
      }));
    return targetNodes;
  }

  get targetData(): AnnouncementTarget[] {
    const selectedCompanyIds: number[] = this.selectedTargets
      .filter((target) => target.data.type === 'COMPANY')
      .map((target) => target.data.id);
    const targetData: AnnouncementTarget[] = this.selectedTargets
      .filter((target) => {
        if (target.data.type === 'COMPANY') {
          return true; // Always include the company
        }
        if (target.data.type === 'DEPARTMENT') {
          const parentCompanyId: number = target.data.companyId;
          // Exclude the department if its parent company is selected
          return !selectedCompanyIds.includes(parentCompanyId);
        }
        return false;
      })
      .map((target) => ({
        sendTo: target.data.id,
        receiverType: target.data.type,
      }));
    return targetData;
  }


  async saveTarget(): Promise<void> {
    const confirmed = await this.messageService.confirmed(
      'Save custom target group',
      'Enter a title',
      'Save',
      'Cancel',
      'WHITE',
      'GREEN',
      true
    );
    if (confirmed.confirmed) {
      this.systemService.showProgress('Saving custom target...', true, false, 3);
      const title: string = confirmed.inputValue;
      this.customTargetGroupService
        .save({ title: title, customTargetGroupEntities: this.targetData })
        .subscribe({
          next: () => {
            this.systemService.stopProgress().then(() => {
              this.messageService.toast('success', 'Saved a custom target.');
            });
          },
          error: (err) => {
            console.error(err);
            this.systemService.stopProgress('ERROR').then(() => {
              this.messageService.toast(
                'error',
                'An unknown error occurred, please contact IT Support.'
              );
            });
          },
        });
    }
  }

  clearPreview(): void {
    this.selectedTargets = [];
    this.overviewSelectedTargets = [];
  }

  // Method to expand or collapse all rows
  // expandAll() {
  //   this.isExpanded = !this.isExpanded;
  //   if (this.isExpanded) {
  //     this.companies.forEach(company => {
  //       this.expandedRows[company.data.id] = true;
  //     });
  //   } else {
  //     this.expandedRows = {}; // Collapse all
  //   }
  // }

  // Method to handle toggling of individual rows
  // toggleExpand(target: any) {
  //   if (this.expandedTarget === target.id) {
  //     // If the clicked target is already expanded, collapse it
  //     this.expandedTarget = null;
  //   } else {
  //     // Expand the clicked target and collapse others
  //     this.expandedTarget = target.id;
  //   }
  // }

  viewDetails(target: TreeNode): void {
    // Implement your logic to view details of the selected target
  }

  // Method to remove a target from the selected targets
  removeTarget(target: TreeNode) {
    this.selectedTargets = this.selectedTargets.filter(t => t.data.id !== target.data.id);
  }
}

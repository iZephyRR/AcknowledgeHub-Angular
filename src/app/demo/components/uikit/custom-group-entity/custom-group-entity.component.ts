import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { Announcement } from 'src/app/modules/announcement';
import { AnnouncementTarget } from 'src/app/modules/announcement-target';
import { CustomTergetGroup } from 'src/app/modules/custom-target-group';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CustomTargetGroupService } from 'src/app/services/custom-target-group/custom-target-group.service';
import { SystemService } from 'src/app/services/system/system.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-custom-group-entity',
  templateUrl: './custom-group-entity.component.html',

})
export class CustomGroupEntityComponent implements OnDestroy, OnInit {
  @ViewChild('filter') filter!: ElementRef;
  @Input() selectItem: CustomTergetGroup;
  announcements: Announcement[] = [];

  constructor(
    private router: Router,
    private customTargetGroupService: CustomTargetGroupService,
    private userService : UserService,
    private authService : AuthService,
    private systemService : SystemService,
    private announcementService : AnnouncementService
  ) { }
  ngOnDestroy(): void {
    this.customTargetGroupService.showEntity = false;
  }
  ngOnInit(): void {
    this.announcementService.getByCustomGroup(this.selectItem.id).subscribe({
      next: (data) => {
        this.announcements = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  back(): void {
    this.customTargetGroupService.showEntity = false;
  }

  showAnnouncementDetails(id: number) {
    this.router.navigate(['/announcement-page', id]);
  }

  showEntityDetails(entity: AnnouncementTarget): void {
    switch (entity.receiverType) {
      case 'COMPANY':
        this.router.navigate(['/company', entity.sendTo]);
        break;
      case 'DEPARTMENT':
        this.router.navigate(['/department', entity.sendTo]);
        break;
      case 'EMPLOYEE':
        this.userService.getUserById(entity.sendTo).subscribe({
          next: (user) => {
            console.log(user);
            this.systemService.showDetails(user);
          },
          error: (err) => {
            console.error(err);
          }
        });
        break;
    }
  }

}

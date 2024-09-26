import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService, ConfirmationService } from 'primeng/api';

import { User, UserProfile } from 'src/app/modules/user';
import { UserService } from 'src/app/services/user/user.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SystemService } from 'src/app/services/system/system.service';

type Status = 'ACTIVATED' | 'DEACTIVATED' | 'DEPARTED';

@Component({
  selector: 'app-table-demo', // Make sure you have a selector if it's standalone
  templateUrl: './tabledemo.component.html',
  providers: [UserService, MessageService, ConfirmationService] // Add UserService here
})
export class TableDemoComponent implements OnInit {
  users: User[] = [];
  userProfile: UserProfile;
  statuses: { label: string; value: Status }[] = [];
  activityValues: number[] = [0, 100];
  selectedUser?: User;
  loading: boolean = false;
  profileImage: SafeUrl | null = null; // To store the selected profile image
  status: any[] = [];
  role: any[] = [];

  @ViewChild('filter') filter!: ElementRef;

  constructor(
    public systemService: SystemService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.retrieveAllUsers();
    this.status = [
      { label: 'ACTIVATED', value: 'ACTIVATED' },
      { label: 'DEACTIVATED', value: 'DEACTIVATED' },
      { label: 'DEPARTED', value: 'DEPARTED' },
      { label: 'DEFAULT', value: 'DEFAULT' }
    ];
    this.role = [
      { label: 'ADMIN', value: 'ADMIN' },
      { label: 'MAIN_HR', value: 'MAIN_HR' },
      { label: 'MAIN_HR_ASSISTANCE', value: 'MAIN_HR_ASSISTANCE' },
      { label: 'HR', value: 'HR' },
      { label: 'HR_ASSISTANCE', value: 'HR_ASSISTANCE' },
      { label: 'STAFF', value: 'STAFF' },
    ]
  }

  retrieveAllUsers(): void {
    this.userService.getAllUsers().subscribe(
      (data: User[]) => {
        this.users = data.map(user => ({
          ...user,
          profileImage: user.photoLink ? `data:image/png;base64,${user.photoLink}` : null
        }))
      },
      (error) => {
        console.error('Error retrieving users:', error);
      });
  }

  onGlobalFilter(table: Table, event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(filterValue, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }

}
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService, ConfirmationService } from 'primeng/api';

import { User, UserProfile } from 'src/app/modules/user';
import { UserService } from 'src/app/services/user/user.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  //sanitizedImages: { [key: number]: SafeUrl } = {};

  @ViewChild('filter') filter!: ElementRef;

  constructor(private userService: UserService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.retrieveAllUsers();
  }

  retrieveAllUsers(): void {
    this.userService.getAllUsers().subscribe(
      (data) => {
        this.users = data;
        console.log("user deatail ", data);
      },
      (error) => {
        console.error('Error retrieving users:', error);
      });
  }
  showDetails(user: User) {
    this.selectedUser = user;
    console.log("selected user : ", user);
    this.profileImage = this.selectedUser.photoLink ? `data:image/png;base64,${this.selectedUser.photoLink}` : undefined;
  }
  closeDetails() {
    this.selectedUser = null;
  }

  onGlobalFilter(table: Table, event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(filterValue, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }
  
}
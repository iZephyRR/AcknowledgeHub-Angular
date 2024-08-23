import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService, ConfirmationService } from 'primeng/api';

import { User } from 'src/app/modules/user';
import { UserService } from 'src/app/services/user/user.service';

type Status = 'ACTIVATED' | 'DEACTIVATED' | 'DEPARTED';

@Component({
    selector: 'app-table-demo', // Make sure you have a selector if it's standalone
    templateUrl: './tabledemo.component.html',
    providers: [UserService, MessageService, ConfirmationService] // Add UserService here
})
export class TableDemoComponent implements OnInit {
    users: User;
    statuses: { label: string; value: Status }[] = [];
    activityValues: number[] = [0, 100];
    selectedUser?:User;
    loading: boolean = false;

    @ViewChild('filter') filter!: ElementRef;

    constructor(private userService: UserService) { }

    ngOnInit(): void {
        this.retrieveAllUsers();
      }
    
      retrieveAllUsers(): void {
        this.userService.getAllUsers().subscribe(
          (data) => {
            this.users = data;
            console.log('Users retrieved:', this.users);
          },
          (error) => {
            console.error('Error retrieving users:', error);
          });
        }
        showDetails(user:User){
          this.selectedUser=user;
        }
        closeDetails(){
          this.selectedUser=null;
        }

    onGlobalFilter(table: Table, event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        table.filterGlobal(filterValue, 'contains');
    }

    clear(table: Table) {
        table.clear();
    }
}
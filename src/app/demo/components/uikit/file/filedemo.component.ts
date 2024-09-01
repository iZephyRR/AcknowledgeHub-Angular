import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from 'src/app/services/user/user.service';
import { User } from 'src/app/modules/user';

type Status = 'ACTIVATED' | 'DEACTIVATED' | 'DEPARTED';

@Component({
    selector: 'app-file-demo',
    templateUrl: './filedemo.component.html',
    providers: [UserService, MessageService, ConfirmationService]
})
export class FileDemoComponent implements OnInit {
    users: User;
    expandedRows: { [key: string]: boolean } = {};
    statuses: { label: string; value: Status }[] = [];
    selectedUser?: User;
    isExpanded: boolean = false;
    loading: boolean = false;

    @ViewChild('filter') filter!: ElementRef;

    constructor(private userService: UserService, private messageService: MessageService) { }

    ngOnInit(): void {
        this.retrieveAllUsers();
    }

    retrieveAllUsers(): void {
      this.userService.getAllUsers().subscribe(
        (data) => {
          this.users=data;
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

    onGlobalFilter(table: Table, event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        table.filterGlobal(filterValue, 'contains');
    }

    clear(table: Table): void {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    // expandAll(): void {
    //     if (!this.isExpanded) {
    //         this.users.forEach(user => user && user.name ? this.expandedRows[user.name] = true : '');
    //     } else {
    //         this.expandedRows = {};
    //     }
    //     this.isExpanded = !this.isExpanded;
    // }
}

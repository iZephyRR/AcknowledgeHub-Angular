import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService, ConfirmationService } from 'primeng/api';

import { UserService } from 'src/app/demo/service/user.service';
import { User } from 'src/app/service/category/modules/user';

type Status = 'ACTIVATED' | 'DEACTIVATED' | 'DEPARTED';

@Component({
    selector: 'app-table-demo', // Make sure you have a selector if it's standalone
    templateUrl: './tabledemo.component.html',
    providers: [UserService, MessageService, ConfirmationService] // Add UserService here
})
export class TableDemoComponent implements OnInit {
    users1: User[] = [];
    statuses: { label: string; value: Status }[] = [];
    activityValues: number[] = [0, 100];
    loading: boolean = true;

    @ViewChild('filter') filter!: ElementRef;

    constructor(private userService: UserService) { }

    ngOnInit() {
        this.userService.getUsersLarge().then(users => {
            this.users1 = users;
            this.loading = false;
            this.users1.forEach(user => user.workentrydate = new Date(user.workentrydate));
        });

        this.statuses = [
            { label: 'Activated', value: 'ACTIVATED' },
            { label: 'Deactivated', value: 'DEACTIVATED' },
            { label: 'Departed', value: 'DEPARTED' }
        ];
        console.log(this.users1);
    }

    onGlobalFilter(table: Table, event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        table.filterGlobal(filterValue, 'contains');
    }

    clear(table: Table) {
        table.clear();
    }
}
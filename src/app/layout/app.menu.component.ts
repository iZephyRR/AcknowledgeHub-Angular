
import { Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../services/auth/auth.service';
import { CompanyService } from '../services/company/company.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit, OnChanges {
    @Input() inputData: string;
    model: any[] = [];
    companies: {
        label:string,
        icon:string,
        routerLink:string[]
    }[] = [];

    constructor(
        public layoutService: LayoutService,
         private authService: AuthService,
         private companyService:CompanyService
        ) {
        companyService.getAllDTO().subscribe({
            next:(data)=>{
                data.map(item=>{
                    this.companies.push({
                        label:item.name,
                        icon:'pi pi-fw pi-list',
                        routerLink:[`/company/${item.id}`]
                    });
                })
            },
            error:(err)=>{
                console.error(err);
            }
        });
    }

    ngOnInit(): void {
        this.refresh();
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['inputData']) {
            this.refresh();
        }
    }
    private refresh(): void {
        this.model =
            this.authService.canActivateFor(['MAIN_HR', 'MAIN_HR_ASSISTANCE', 'HR', 'HR_ASSISTANCE']) ?
                [
                    {
                        label: 'Home',
                        items: [
                            { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
                        ],
                    },
                    {
                        label: 'Pages',
                        icon: 'pi pi-fw pi-briefcase',
                        items: [
                            {
                                label: 'Announcement',
                                icon: 'pi pi-fw pi-megaphone',
                                items: [
                                    {
                                        label: 'Create Announcement',
                                        icon: 'pi pi-fw pi-pencil',
                                        routerLink: ['/announcement/create']
                                    },
                                    {
                                        label: 'Announcement For Customize Employees',
                                        icon: 'pi pi-fw pi-list',
                                        routerLink: ['/announcement/customize']
                                    },
                                    {
                                        label: 'Announcement List',
                                        icon: 'pi pi-fw pi-list',
                                        routerLink: ['/announcement/list']
                                    },
                                    {
                                        label: 'Test2',
                                        icon: 'pi pi-fw pi-list',
                                        routerLink: ['/announcement/file']
                                    },
                                    {
                                        label: 'Add Department',
                                        icon: 'pi pi-fw pi-list',
                                        routerLink: ['/announcement/button']
                                    },

                                    {
                                        label: 'Announcement reports',
                                        icon: 'pi pi-fw pi-list',
                                        routerLink: ['/announcement/reports']
                                    }
                                ]
                            },
                            {
                                label: 'Company infomations',
                                icon: 'pi pi-fw pi-tags',
                                items: this.companies
                                
                            },
                            {
                                label: 'Category',
                                icon: 'pi pi-fw pi-tags',
                                routerLink: ['/announcement/category']
                            },
                            {
                                label: 'Draft',
                                icon: 'pi pi-fw pi-calendar',
                                routerLink: ['/announcement/drafts']
                            },
                            {
                                label: 'Reports',
                                icon: 'pi pi-fw pi-calendar',
                                routerLink: ['/pages/timeline']
                            },
                            {
                                label: 'Employee List',
                                icon: 'pi pi-fw pi-user',
                                routerLink: ['/announcement/table']
                            },

                        ]
                    }
                ] :
                [
                    {
                        label: 'Admin dashboard',
                        items: [
                            {
                                label: 'System Settings',
                                icon: 'pi pi-fw pi-cog',
                                items: [
                                    {
                                        label: 'Authentication',
                                        icon: 'pi pi-fw pi-user',
                                        routerLink: ['/announcement/table']
                                    },
                                ]
                            }
                        ]
                    }
                ];
    }
}

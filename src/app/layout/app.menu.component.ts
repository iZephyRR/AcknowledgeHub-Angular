
import { Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../services/auth/auth.service';
import { AnnouncementService } from '../services/announcement/announcement.service';
import { CompanyService } from '../services/company/company.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnChanges {
    @Input() inputData: string;
    model: any[] = [];
    announcements: {
        label: string,
        icon: string,
        routerLink: string[]
    }[] = [];

    companies: {
        label: string,
        icon: string,
        routerLink: string[]
    }[] = [];

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private companyService: CompanyService,
        private announcementService: AnnouncementService
    ) {
        companyService.getAllDTO().subscribe({
            next: (data) => {
                data.map(item => {
                    this.companies.push({
                        label: item.name,
                        icon: 'pi pi-fw pi-list',
                        routerLink: [`/company/${item.id}`]
                    });
                })
            },
            error: (err) => {
                console.error(err);
            }
        }); announcementService.getAllAnnouncementsWithCompanyId('companyId').subscribe({
            next: (data) => {
                data.map(item => {
                    this.announcements.push({
                        label: item.title,
                        icon: 'pi pi-fw pi-megaphone',
                        routerLink: [`/announcement-view/company/${item.id}`]
                    });
                })
            },

            error: (err) => {
                console.error(err);
            }
        });
        announcementService.getAllAnnouncementsWithDepartmentId('departmentId').subscribe({
            next: (data) => {
                data.map(item => {
                    this.announcements.push({
                        label: item.title,
                        icon: 'pi pi-fw pi-megaphone',
                        routerLink: [`/announcement-view/department/${item.id}`]
                    });
                })
            },
            error: (err) => {
                console.error(err);
            }
        });
        announcementService.getAnnouncementsForEmployee().subscribe({
            next: (data) => {
                data.map(item => {
                    this.announcements.push({
                        label: item.title,
                        icon: 'pi pi-fw pi-megaphone',
                        routerLink: [`/announcement-view/employee/${item.id}`]
                    });
                })
            },
            error: (err) => {
                console.error(err);
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['inputData']) {
            this.refresh();
        }

    }
    private refresh(): void {
        this.model = this.authService.canActivateFor(['MAIN_HR', 'MAIN_HR_ASSISTANCE', 'HR', 'HR_ASSISTANCE','STAFF']) ?
            [
                {
                    label: 'Home',
                    items: [
                        { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
                    ]
                },
                {
                    label: 'Pages',
                    icon: 'pi pi-fw pi-briefcase',
                    items: [
                        ...this.authService.canActivateFor(['MAIN_HR', 'MAIN_HR_ASSISTANCE', 'HR', 'HR_ASSISTANCE','STAFF']) ?[
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
                                        label: 'Announcement List',
                                        icon: 'pi pi-fw pi-list',
                                        routerLink: ['/announcement/list']
                                    },
                                    {
                                        label: 'Create custom target group',
                                        icon: 'pi pi-fw pi-list',
                                        routerLink: ['/announcement/file']
                                    },
                                    {
                                        label: 'Announcement reports',
                                        icon: 'pi pi-fw pi-list',
                                        routerLink: ['/announcement/reports']

                                    },
                                    {
                                        label: 'Announcement floatlabel',
                                        icon: 'pi pi-fw pi-floatlabel',
                                        routerLink: ['/announcement/floatlabel']
                                    }
                                ]
                            }
                        ]:[],
                        {
                            label: 'Announcements',
                            icon: 'pi pi-fw pi-tags',
                            items: this.announcements
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
                            routerLink: ['/announcement/employeelist']

                        },
                        {
                            label: 'Chart List',
                            icon: 'pi pi-fw pi-list',
                            routerLink: ['/announcement/charts']
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

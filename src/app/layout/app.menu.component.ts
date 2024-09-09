
import { Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../services/auth/auth.service';
import { AnnouncementService } from '../services/announcement/announcement.service';

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


    constructor(public layoutService: LayoutService, private authService: AuthService, private announcementService: AnnouncementService) {
        announcementService.getAllAnnouncementsWithCompanyId('companyId').subscribe({
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
        this.model = [
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
                    ...(this.authService.canActivateFor(['MAIN_HR', 'MAIN_HR_ASSISTANCE', 'HR', 'HR_ASSISTANCE']) ? [
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
                                    label: 'Test1',
                                    icon: 'pi pi-fw pi-list',
                                    routerLink: ['/announcement/button']
                                },
                                {
                                    label: 'Announcement reports',
                                    icon: 'pi pi-fw pi-list',
                                    routerLink: ['/announcement/reports']
                                }
                            ]
                        }
                    ] : []
                    )
                    ,


                    {
                        label: 'Announcements',
                        icon: 'pi pi-fw pi-tags',
                        items: this.announcements
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

                ]
            }
        ];
    }
}

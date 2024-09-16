
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
    companyName: string;
    mainAnnouncements: {
        label: string,
        icon: string,
        routerLink: string[]
    }[] = [];
    subAnnouncements: {
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
        this.companies.push({
            label:'Add new company',
            icon:'',
            routerLink:['/company']
        });
        companyService.getName().subscribe({
            next: (data) => {
                this.companyName = data.STRING_RESPONSE;
            }
        });
        companyService.getAllDTO().subscribe({
            next: (data) => {
                data.forEach(item => {
                    this.companies.push({
                        label: item.name,
                        icon: 'pi pi-fw pi-list',
                        routerLink: [`/company/${item.id}`]
                    });
                });
            },
            error: (err) => {
                console.error(err);
            }
        });
         announcementService.getMainPreview().subscribe({
            next: (data) => {
                data.map(item => {
                    this.mainAnnouncements.push({
                        label: item.label,
                        icon: 'pi pi-fw pi-megaphone',
                        routerLink: [`/announcement-page/${item.id}`]
                    });
                })
            },

            error: (err) => {
                console.error(err);
            }
        });
        announcementService.getSubPreview().subscribe({
            next: (data) => {
                data.map(item => {
                    this.subAnnouncements.push({
                        label: item.label,
                        icon: 'pi pi-fw pi-megaphone',
                        routerLink: [`/announcement-page/${item.id}`]
                        
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
    test():void{
        console.log("Testing");
    }
    private refresh(): void {
        this.model = [
            ...this.authService.canActivateFor(['MAIN_HR', 'MAIN_HR_ASSISTANCE', 'HR', 'HR_ASSISTANCE']) ? [
                {
                    label: 'Home',
                    items: [
                        { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] }
                    ]
                }] : [],
            ...this.authService.canActivateFor(['ADMIN']) ? [
                {
                    label: 'Admin dashboard',
                    items: [
                        {
                            label: 'System Settings',
                            icon: 'pi pi-fw pi-cog',
                            routerLink: ['/ad/settings']
                        }
                    ]
                }
            ] :
                [],
            {
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                items: [
                    ...this.authService.canActivateFor(['MAIN_HR', 'MAIN_HR_ASSISTANCE', 'HR', 'HR_ASSISTANCE']) ? [
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
                        },
                        {
                            label: 'Company infomations',
                            icon: 'pi pi-fw pi-tags',
                            items: this.companies

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
                        }, {
                            label: 'Employee List',
                            icon: 'pi pi-fw pi-user',
                            routerLink: ['/announcement/employeelist']

                        }] : [],
                    ...this.authService.canActivateFor(['ADMIN', 'MAIN_HR_ASSISTANCE', 'HR', 'HR_ASSISTANCE', 'STAFF']) ? [
                        {
                            label: 'Announcements',
                            icon: 'pi pi-fw pi-tags',
                            items: [
                                {
                                    label: 'ACE Datasystem',
                                    icon: 'pi pi-fw pi-calendar',
                                    items: this.mainAnnouncements
                                },
                                ...this.authService.canActivateFor(['HR_ASSISTANCE', 'STAFF']) ? [
                                    {
                                        label: this.companyName,
                                        icon: 'pi pi-fw pi-calendar',
                                        items:this.subAnnouncements
                                    }
                                ] : [],
                            ]
                        }
                    ] : [
                        {
                            label: 'Category',
                            icon: 'pi pi-fw pi-tags',
                            routerLink: ['/announcement/category']
                        },
                        {
                            label: 'Chart List',
                            icon: 'pi pi-fw pi-list',
                            routerLink: ['/announcement/charts']
                        }],
                ]
            }

        ];

    }
}

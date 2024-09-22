
import { Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../services/auth/auth.service';
import { AnnouncementService } from '../services/announcement/announcement.service';
import { CompanyService } from '../services/company/company.service';
import { NbClickTriggerStrategy } from '@nebular/theme';
import { _isClickEvent } from 'chart.js/dist/helpers/helpers.core';

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
        routerLink?: string[],
        command?:any
    }[] = [];
    subAnnouncements: {
        label: string,
        icon: string,
        routerLink?: string[],
        command?: any
    }[] = [];

    companies: {
        label: string,
        icon: string,
        routerLink: string[]
    }[] = [];
    enableMain: boolean = true;
    enableSub: boolean = true;
    mainCount:number=0;
    subCount:number=0;
    showMoreMain = {
        label: 'Show more',
        icon: '',
        command: () => this.addMainPreviews()
    };
    showMoreSub = {
        label: 'Show more',
        icon: '',
        command: () => this.addSubPreviews()
    };

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private companyService: CompanyService,
        private announcementService: AnnouncementService
    ) {
        this.companies.push({
            label: 'Add new company',
            icon: '',
            routerLink: ['/company']
        });
        this.companyService.getName().subscribe({
            next: (data) => {
                this.companyName = data.STRING_RESPONSE;
            },
            complete: () => {
                this.refresh();
            }
        });
        this.companyService.getAllDTO().subscribe({
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
        this.addMainPreviews();
        this.addSubPreviews();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['inputData']) {
            this.refresh();
        }
    }
    
    addMainPreviews(): void {
        this.mainAnnouncements.pop();
        this.announcementService.getMainPreview(this.mainCount++).subscribe({
            next: (data) => {
                data.content.forEach(item => {
                    this.mainAnnouncements.push({
                        label: item.label,
                        icon: 'pi pi-fw pi-megaphone',
                        routerLink: [`/announcement-page/${item.id}`]
                    });
                });
                if (data.last) {
                    this.enableMain = false;
                }
            },
            complete: () => {
                if (this.enableMain) {
                    this.mainAnnouncements.push(this.showMoreMain);
                }
            },
            error: (err) => {
                console.error(err);
            }
        });
    }

    addSubPreviews(): void {
        this.subAnnouncements.pop();
        this.announcementService.getSubPreview(this.subCount++).subscribe({
            next: (data) => {
                data.content.forEach(item => {
                    this.subAnnouncements.push({
                        label: item.label,
                        icon: 'pi pi-fw pi-megaphone',
                        routerLink: [`/announcement-page/${item.id}`]
                    });
                });
                if (data.last) {
                    this.enableSub = false;
                }
            },
            complete: () => {
                if (this.enableSub) {
                    this.subAnnouncements.push(this.showMoreSub);
                }
            },
            error: (err) => {
                console.error(err);
            }
        });
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
                label: this.authService.canActivateFor(['HR_ASSISTANCE', 'STAFF']) ? 'Announcements' : 'Pages',
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
                                    label: 'Schedule-list',
                                    icon: 'pi pi-fw pi-list',
                                    routerLink: ['/announcement/schedule-list']

                                },
                                {
                                    label: 'Announcement floatlabel',
                                    icon: 'pi pi-fw pi-floatlabel',
                                    routerLink: ['/announcement/floatlabel']
                                }
                            ]
                        },
                        ...this.authService.role == 'MAIN_HR' ? [
                            {
                                label: 'Company infomations',
                                icon: 'pi pi-fw pi-tags',
                                items: this.companies
                            }
                        ] :
                            [
                                {
                                    label: 'Company infomations',
                                    icon: 'pi pi-fw pi-tags',
                                    routerLink: ['/company']
                                }
                            ],

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
                    //
                    ...this.authService.canActivateFor(['HR_ASSISTANCE', 'STAFF']) ? [

                        {
                            label: 'ACE Datasystem',
                            icon: 'pi pi-fw pi-calendar',
                            items: this.mainAnnouncements
                        },
                        {
                            label: this.companyName,
                            icon: 'pi pi-fw pi-calendar',
                            items: this.subAnnouncements
                            // .concat(...this.enable?[{
                            //     label: 'Show more',
                            //     icon: '',
                            //     command: () => this.addSubPreviews()
                            // }]:[])
                        }
                    ] : [
                        ...this.authService.canActivateFor(['ADMIN', 'MAIN_HR_ASSISTANCE', 'HR']) ? [
                            {
                                label: 'Announcements',
                                icon: 'pi pi-fw pi-tags',
                                items: this.mainAnnouncements
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
                            }
                        ]
                    ],
                ]
            }
        ];
    }
}

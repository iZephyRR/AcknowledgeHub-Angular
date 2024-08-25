import { Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../services/auth/auth.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit, OnChanges {
    @Input() inputData: string;
    model: any[] = [];

    constructor(public layoutService: LayoutService, private authService: AuthService) { }

    ngOnInit(): void {
        this.refresh();
    }
    ngOnChanges(changes: SimpleChanges): void {
        if(changes['inputData']){
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
                    ...(this.authService.canActivateFor(['MAIN_HR','MAIN_HR_ASSISTANCE','HR','HR_ASSISTANCE']) ? [
                        {
                            label: 'Announcement',
                            icon: 'pi pi-fw pi-megaphone',
                            items: [
                                {
                                    label: 'Create Announcement',
                                    icon: 'pi pi-fw pi-pencil',
                                    routerLink: ['/uikit/formlayout']
                                },
                                {
                                    label: 'Announcement List',
                                    icon: 'pi pi-fw pi-list',
                                    routerLink: ['/uikit/media']
                                },
                                {
                                    label: 'Announcement reports',
                                    icon: 'pi pi-fw pi-list',
                                    routerLink: ['/uikit/charts']
                                },
                                {
                                    label: 'Test',
                                    icon: 'pi pi-fw pi-list',
                                    routerLink: ['/uikit/button']
                                },
                                
                            ]
                        }
                    ] : []
                    )
                    ,
                    {
                        label: 'Category',
                        icon: 'pi pi-fw pi-tags',
                        routerLink: ['/uikit/list']
                    },
                    {
                        label: 'Reports',
                        icon: 'pi pi-fw pi-calendar',
                        routerLink: ['/pages/timeline']
                    },
                    {
                        label: 'Employee List',
                        icon: 'pi pi-fw pi-user',
                        routerLink: ['/uikit/table']
                    },

                ]
            }
        ];
    }
}

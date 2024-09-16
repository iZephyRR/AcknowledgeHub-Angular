import { RouterModule } from '@angular/router';
import { NgModule, signal } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { AuthGuard } from './guards/auth.guard';
import { ServerErrorComponent } from './demo/components/server-error/server-error.component';
import { AnnouncementDetailsComponent } from './demo/components/uikit/announcementdetails/announcementdetails.component';
import { PanelsDemoComponent } from './demo/components/uikit/panels/panelsdemo.component';
import { SystemSettingsComponent } from './demo/components/system-settings/system-settings.component';
import { LoginComponent } from './demo/components/auth/login/login.component';
import { DashboardComponent } from './demo/components/dashboard/dashboard.component';
import { DepartmentsComponent } from './demo/components/departments/departments.component';
import { DepartmentComponent } from './demo/components/department/department.component';
import { AddCompanyComponent } from './demo/components/add-company/add-company.component';


@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '',
                component: AppLayoutComponent,
                canActivate: [AuthGuard],
                children: [
                    {
                        path: 'dashboard',
                        canActivate: [AuthGuard],
                        data: { roles: ['MAIN_HR', 'MAIN_HR_ASSISTANCE', 'HR', 'HR_ASSISTANCE'] },
                        component: DashboardComponent
                    },
                    {
                        path: 'announcement',
                        canActivate: [AuthGuard],

                        data: { roles: ['MAIN_HR', 'MAIN_HR_ASSISTANCE', 'HR', 'HR_ASSISTANCE'] },
                        loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UIkitModule)
                    },
                    {
                        path: 'announcement-page/:id',
                        canActivate: [AuthGuard],
                        data: { roles: ['ADMIN', 'MAIN_HR_ASSISTANCE', 'HR', 'HR_ASSISTANCE', 'STAFF'] },
                        component: AnnouncementDetailsComponent
                    },
                    {
                        path: 'company',
                        canActivate: [AuthGuard],
                        data: { roles: ['MAIN_HR'] },
                        component: AddCompanyComponent
                    },
                    {
                        path: 'company/:id',
                        canActivate: [AuthGuard],
                        data: { roles: ['MAIN_HR', 'MAIN_HR_ASSISTANCE', 'HR', 'HR_ASSISTANCE'] },
                        component: DepartmentsComponent

                    },
                    {
                        path: 'department/:id',
                        canActivate: [AuthGuard],
                        data: { roles: ['MAIN_HR', 'MAIN_HR_ASSISTANCE', 'HR', 'HR_ASSISTANCE'] },
                        component: DepartmentComponent
                    },
                    {
                        path: 'ad',
                        children: [
                            {
                                path: 'settings',
                                canActivate: [AuthGuard],
                                data: { roles: ['ADMIN'] },
                                component: SystemSettingsComponent
                            },
                        ]
                    },
                ]
            },
            {
                path: 'login',
                component: LoginComponent
            },
            {
                path: 'error',
                component: ServerErrorComponent
            },
            {
                path: '**',
                component: NotfoundComponent,
                canActivate: [AuthGuard]
            },
        ],
            { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })

    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}

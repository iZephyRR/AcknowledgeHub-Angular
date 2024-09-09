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


@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '',
                component: AppLayoutComponent,
                canActivate: [AuthGuard],
                children: [
                    {
                        path: '',
                        component: DashboardComponent
                    },
                    {
                        path: 'announcement',
                        canActivate: [AuthGuard],

                        data: { roles: ['MAIN_HR', 'MAIN_HR_ASSISTANCE', 'HR', 'HR_ASSISTANCE'] },//Just for example. Anyone can change.
                        loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UIkitModule)
                    },
 {
                        path: 'announcement-view',
                        children: [
                            { path: 'company/:id', component: AnnouncementDetailsComponent },
                            { path: 'department/:id', component: AnnouncementDetailsComponent },
                            { path: 'employee/:id', component: AnnouncementDetailsComponent }
                        ]
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
                                path: 'setting',
                                canActivate:[AuthGuard],
                                data:{roles:['ADMIN']},
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
                canActivate:[AuthGuard]
            },
        ],
            { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })

    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}

import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { AuthGuard } from './guards/auth.guard';
import { ServerErrorComponent } from './demo/components/server-error/server-error.component';
import { AnnouncementDetailsComponent } from './demo/components/uikit/announcementdetails/announcementdetails.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppLayoutComponent,
                canActivate: [AuthGuard],
                children: [
                    { path: '', loadChildren: () => import('./demo/components/dashboard/dashboard.module').then(m => m.DashboardModule) },
                    {
                        path: 'announcement',
                        canActivate: [AuthGuard],
                        data: { roles: ['MAIN_HR', 'MAIN_HR_ASSISTANCE', 'HR', 'HR_ASSISTANCE'] },//Just for example. Anyone can change.

                        loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UIkitModule)
                    }

                    , {
                        path: 'announcement-view',
                        children: [
                            { path: 'company/:id', component: AnnouncementDetailsComponent },
                            { path: 'department/:id', component: AnnouncementDetailsComponent },
                            { path: 'employee/:id', component: AnnouncementDetailsComponent }
                        ]
                    },

                    {
                        path: 'utilities',
                        canActivate: [AuthGuard], loadChildren: () => import('./demo/components/utilities/utilities.module').then(m => m.UtilitiesModule)
                    },
                    {
                        path: 'profile',
                        canActivate: [AuthGuard], loadChildren: () => import('./demo/components/profile/profile.module').then(m => m.ProfileModule)
                    },
                    {
                        path: 'blocks',
                        canActivate: [AuthGuard], loadChildren: () => import('./demo/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule)
                    },
                    {
                        path: 'pages',
                        canActivate: [AuthGuard], loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule)
                    },
                    // { path: 'notifications', component: NotificationComponent }, // Add this route for notifications
                ]
            },
            { path: 'auth', loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) },
            { path: 'notfound', component: NotfoundComponent },
            { path: 'error', component: ServerErrorComponent },
            { path: '**', redirectTo: '/notfound' },
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TableDemoComponent } from './table/tabledemo.component';
import { MediaDemoComponent } from './media/mediademo.component';
import { CategoryComponent } from './category/category.component';
import { AnnouncementreportComponent } from './announcementreport/announcementreport.component';
import { OverlaysDemoComponent } from './overlays/overlaysdemo.component';
import { FileDemoComponent } from './file/filedemo.component';
import { CustomGroupListComponent } from './custom-group-list/custom-group-list.component';


@NgModule({
    imports: [RouterModule.forChild([
        { path: 'custom-target/create', component:FileDemoComponent},
        { path: 'custom-target', component:CustomGroupListComponent},
        { path: 'floatlabel', data: { breadcrumb: 'Float Label' }, loadChildren: () => import('./floatlabel/floatlabeldemo.module').then(m => m.FloatlabelDemoModule) },
        { path: 'create', data: { breadcrumb: 'Form Layout' }, loadChildren: () => import('./formlayout/formlayoutdemo.module').then(m => m.FormLayoutDemoModule) },
        { path: 'schedule-list', data: { breadcrumb: 'Input' }, loadChildren: () => import('./input/inputdemo.module').then(m => m.InputDemoModule) },
        { path: 'invalidstate', data: { breadcrumb: 'Invalid State' }, loadChildren: () => import('./invalid/invalidstatedemo.module').then(m => m.InvalidStateDemoModule) },
        { path: 'category', component:CategoryComponent},
        { path: 'list',component:MediaDemoComponent},
        { path: 'report',component: AnnouncementreportComponent},
        { path: 'message', data: { breadcrumb: 'Message' }, loadChildren: () => import('./messages/messagesdemo.module').then(m => m.MessagesDemoModule) },
        { path: 'drafts', component:OverlaysDemoComponent},
        //{ path: 'drafts', data: { breadcrumb: 'Overlay' }, loadChildren: () => import('./overlays/overlaysdemo.module').then(m => m.OverlaysDemoModule) },
        { path: 'Panel', data: { breadcrumb: 'Panel' }, loadChildren: () => import('./panels/panelsdemo.module').then(m => m.PanelsDemoModule) },
        { path: 'employeelist',component:TableDemoComponent},
        { path: 'notedOneDay/:id', data: { breadcrumb: 'Panel' }, loadChildren: () => import('./panels/panelsdemo.module').then(m => m.PanelsDemoModule) },
        { path: 'notedThreeDay/:id', data: { breadcrumb: 'Panel' }, loadChildren: () => import('./panels/panelsdemo.module').then(m => m.PanelsDemoModule) },
        { path: 'menu', data: { breadcrumb: 'Menu' }, loadChildren: () => import('./menus/menus.module').then(m => m.MenusModule) },
        { path: 'customize', data: { breadcrumb: 'Panels' }, loadChildren: () => import('./panels/panelsdemo.module').then(m => m.PanelsDemoModule) }
    ])],
    exports: [RouterModule]
})
export class UIkitRoutingModule { }

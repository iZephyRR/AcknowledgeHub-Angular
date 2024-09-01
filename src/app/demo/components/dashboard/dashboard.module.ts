import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { DashboardsRoutingModule } from './dashboard-routing.module';
import { ToastModule } from 'primeng/toast';
import { NgxEchartsModule } from 'ngx-echarts'; // Import NgxEchartsModule
import { EchartsBarAnimationComponent  } from '../uikit/charts/echarts-bar-animation.component';
import { NbThemeModule, NbLayoutModule } from '@nebular/theme';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ChartModule,
        MenuModule,
        TableModule,
        StyleClassModule,
        PanelMenuModule,
        ButtonModule,
        DashboardsRoutingModule,
        ToastModule,
        NbThemeModule.forRoot(), // Add this line
        NbLayoutModule,
        NgxEchartsModule.forRoot({ echarts: () => import('echarts') }), // Initialize NgxEchartsModule
        DashboardsRoutingModule
    ],
    declarations: [
        DashboardComponent,
             ]
})
export class DashboardModule { }

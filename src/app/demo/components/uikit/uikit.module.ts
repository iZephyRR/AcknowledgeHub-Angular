import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIkitRoutingModule } from './uikit-routing.module';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { BrowserModule } from '@angular/platform-browser';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { ProgressBarModule } from 'primeng/progressbar';

@NgModule({
  imports: [
    CommonModule,
    UIkitRoutingModule,
    NgxEchartsModule.forRoot({ echarts }),
    ProgressBarModule
    // Ensure NgxEchartsModule is imported correctly
  ],

})
export class UIkitModule {}

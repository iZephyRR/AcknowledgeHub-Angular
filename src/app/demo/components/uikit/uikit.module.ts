import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIkitRoutingModule } from './uikit-routing.module';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

@NgModule({
  imports: [
    CommonModule,
    UIkitRoutingModule,
    NgxEchartsModule.forRoot({ echarts }),
    // Ensure NgxEchartsModule is imported correctly
  ],
})
export class UIkitModule {}

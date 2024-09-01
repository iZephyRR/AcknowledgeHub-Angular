import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsDemoRoutingModule } from './chartsdemo-routing.module';
import { ChartsDemoComponent } from './chartsdemo.component';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

// Import your components
import { EchartsBarAnimationComponent } from './echarts-bar-animation.component';
import { ChartjsBarHorizontalComponent } from './chartjs-bar-horizontal.components';

export function createECharts(): any {
  return echarts;
}

@NgModule({
  imports: [
    CommonModule,
    ChartsDemoRoutingModule,
    NgxEchartsModule,
    NgxEchartsModule.forRoot({ echarts: createECharts() }),  // Use a factory function

  ],
  declarations: [
    EchartsBarAnimationComponent,
    ChartjsBarHorizontalComponent,
    ChartsDemoComponent,
  ],
})
export class ChartsDemoModule { }

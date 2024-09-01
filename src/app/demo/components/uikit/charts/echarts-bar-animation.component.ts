import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-echarts-bar-animation',
  template: `
    <div echarts [options]="options" class="echart"></div>
  `,
  styles: [`
    .echart {
        width: 500px;
      height: 500px;
    }
  `]
})
export class EchartsBarAnimationComponent implements AfterViewInit, OnDestroy {
  options: EChartsOption = {};
  themeSubscription: Subscription;

  constructor(private theme: NbThemeService) {}

  ngAfterViewInit() {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      console.log('Theme config:', config);

      const xAxisData = [];
      const data1 = [];
      const data2 = [];

      const colors: any = config.variables;
      const echarts: any = config.variables['echarts'] || {};

      if (!echarts) {
        console.error('ECharts theme configuration is missing.');
        return;
      }

      this.options = {
        backgroundColor: echarts.bg || '#ffffff',
        color: [colors.primaryLight || '#00f', colors.infoLight || '#0f0'],
        legend: {
          data: ['bar', 'bar2'],
          align: 'left',
          textStyle: {
            color: echarts.textColor || '#333',
          },
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisTick: {
            alignWithLabel: true,
          },
          axisLine: {
            lineStyle: {
              color: echarts.axisLineColor || '#ddd',
            },
          },
          axisLabel: {
            color: echarts.textColor || '#333',
          },
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: echarts.axisLineColor || '#ddd',
            },
          },
          splitLine: {
            lineStyle: {
              color: echarts.splitLineColor || '#eee',
            },
          },
          axisLabel: {
            color: echarts.textColor || '#333',
          },
        },
        series: [
          {
            name: 'bar',
            type: 'bar',
            data: data1,
            animationDelay: idx => idx * 10,
          },
          {
            name: 'bar2',
            type: 'bar',
            data: data2,
            animationDelay: idx => idx * 10 + 100,
          },
        ],
        animationEasing: 'elasticOut',
        animationDelayUpdate: idx => idx * 5,
      };

      for (let i = 0; i < 100; i++) {
        xAxisData.push('Category ' + i);
        data1.push((Math.sin(i / 5) * (i / 5 - 10) + i / 6) * 5);
        data2.push((Math.cos(i / 5) * (i / 5 - 10) + i / 6) * 5);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}

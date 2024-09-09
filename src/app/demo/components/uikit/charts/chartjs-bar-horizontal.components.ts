import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import Chart from 'chart.js/auto';

@Component({
  selector: 'ngx-chartjs-bar-horizontal',
  template: `<div class="chartjs-container">
               <canvas #chartCanvas></canvas>
             </div>`,
  styles: [`
    .chartjs-container {
      width: 550px;
      height: 500px;
    }

    /* Ensure the canvas takes full width and height */
    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  `]
})
export class ChartjsBarHorizontalComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas: ElementRef<HTMLCanvasElement>;
  chart: Chart<'bar'>;
  themeSubscription: any;

  constructor(private theme: NbThemeService) {}

  ngOnInit() {
    setTimeout(() => {
      this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
        const colors: any = config.variables;
        const chartjs: any = config.variables['chartjs'];

        this.chart = new Chart(this.chartCanvas.nativeElement, {
          type: 'bar',
          data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [
              {
                label: 'Dataset 1',
                backgroundColor: colors.infoLight,
                borderColor: colors.info,
                borderWidth: 1,
                data: this.generateData(),
              },
              {
                label: 'Dataset 2',
                backgroundColor: colors.successLight,
                borderColor: colors.success,
                data: this.generateData(),
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,  // Ensures the chart fits the container
            indexAxis: 'y', // Horizontal bars
            scales: {
              x: {
                grid: {
                  color: chartjs?.axisLineColor || '#ddd',
                },
                ticks: {
                  color: chartjs?.textColor || '#333',
                },
              },
              y: {
                grid: {
                  color: chartjs?.axisLineColor || '#ddd',
                },
                ticks: {
                  color: chartjs?.textColor || '#333',
                },
              },
            },
            plugins: {
              legend: {
                display: true,
                position: 'right',
                labels: {
                  color: chartjs?.textColor || '#333',
                },
              },
            },
          },
        });
      });
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  private generateData(): number[] {
    return Array(6).fill(0).map(() => Math.round(Math.random() * 100));
  }
}

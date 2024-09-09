import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'pie-chart',
  template: '<canvas #piechart></canvas>',
})
export class PiechartComponent implements OnInit, OnDestroy {
  @ViewChild('piechart', { static: true }) pieChartRef!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart<'pie', number[], string>;

  ngOnInit(): void {
    this.initPieChart();
  }

  initPieChart(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const pieChartData = {
      labels: ['All Employees', 'Managers', 'HR', 'IT Department', 'Finance'],
      datasets: [
        {
          data: [300, 50, 100, 80, 20],
          backgroundColor: [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--orange-500'),
            documentStyle.getPropertyValue('--cyan-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--purple-500')
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--blue-600'),
            documentStyle.getPropertyValue('--orange-600'),
            documentStyle.getPropertyValue('--cyan-600'),
            documentStyle.getPropertyValue('--green-600'),
            documentStyle.getPropertyValue('--purple-600')
          ],
          borderColor: surfaceBorder,
          borderWidth: 2,
        }
      ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom', // Legend below the pie chart
            labels: {
              color: documentStyle.getPropertyValue('--text-color'),
              boxWidth: 20,
              padding: 15,
            }
          }
        },
        layout: {
          padding: {
            top: 20,
            bottom: 20,
          },
        },
      };


    this.chart = new Chart(this.pieChartRef.nativeElement, {
      type: 'pie',
      data: pieChartData,
      options: options as any // In case of further option type issues, you can cast it as 'any' for now
    });
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}

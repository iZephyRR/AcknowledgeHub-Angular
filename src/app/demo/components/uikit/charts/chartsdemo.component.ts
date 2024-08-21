import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart, { ChartType, ChartData, ChartOptions } from 'chart.js/auto';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import { Announcement } from 'src/app/modules/announcement';

@Component({
  selector: 'app-charts-demo',
  templateUrl: './chartsdemo.component.html',
})
export class ChartsDemoComponent implements OnInit {
  @ViewChild('barChart', { static: true }) barChart!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart<"bar", number[], string>;
  announcementsByMonth: Map<string, Announcement[]>;

  constructor(private announcementService: AnnouncementService) {}

  ngOnInit(): void {
    this.announcementService.getAnnouncementsForAugToOct2024().subscribe(
      (data) => {
        this.announcementsByMonth = data;
        const monthlyData = this.processData(data);

        const labels = Object.keys(monthlyData); // ['August', 'September', 'October']
        const values = Object.values(monthlyData); // [number of announcements in August, September, October]

        // Initialize the chart
        this.chart = new Chart(this.barChart.nativeElement, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Announcements',
                data: values, // The number of announcements per month
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      },
      (error) => {
        console.error('Error fetching announcements', error);
      }
    );
  }

  private processData(data: Map<string, Announcement[]>): { [key: string]: number } {
    const monthlyData: { [key: string]: number } = {};
    for (const [month, announcements] of Object.entries(data)) {
      monthlyData[month] = announcements.length;
    }
    return monthlyData;
  }
}
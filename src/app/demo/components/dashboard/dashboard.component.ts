import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import { Announcement } from 'src/app/modules/announcement';
import { UserService } from 'src/app/services/user/user.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
    announcements: Announcement[] = [];
    announcementCount: number = 0; // Property to hold the count
    lineChartData: any;
    barChartData: any;
    pieChartData: any;
    donutChartData: any;
    chartOptions: any;
    subscription!: Subscription;
    employeeCount: number = 0;
   
    constructor(
        private announcementService: AnnouncementService,
        private userService: UserService // Inject UserService here
      ) {}

    ngOnInit(): void {
        this.fetchAnnouncements();
        this.countAnnouncements(); // Call the count method on initialization
        this.initChart();
        this.countEmployees();
    }

    fetchAnnouncements(): void {
        this.subscription = this.announcementService.getAllAnnouncements().subscribe(
            data => {
                this.announcements = data;
                this.updateCharts(data);
            },
            error => {
                console.error('Error fetching announcements', error);
            }
        );
    }

    countAnnouncements(): void {
        this.announcementService.countAnnouncements().subscribe(
            (count: number) => {
                this.announcementCount = count; // Store the result in the property
            },
            (error) => {
                console.error('Error counting announcements', error);
            }
        );
    }
    countEmployees(): void {
        this.userService. getEmployeeCount().subscribe(
            (count: number) => {
                this.employeeCount = count; // Store the result in the property
            },
            (error) => {
                console.error('Error counting employees', error);
            }
        );
    }
    updateCharts(announcements: Announcement[]): void {
        // Process the announcements data to update the charts accordingly
        // This part depends on how you'd like to visualize the data in the charts
        // For example, you could count the number of announcements per category for the bar chart
        // Or analyze the status for the donut chart, etc.
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // Example of initial static chart data; this can be updated dynamically in `updateCharts`
        this.lineChartData = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'Announcements',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    borderColor: documentStyle.getPropertyValue('--blue-500'),
                    tension: 0.4
                }
            ]
        };

        this.barChartData = {
            labels: ['Holidays', 'Salary', 'Must Know', 'Office Rules', 'General'],
            datasets: [
                {
                    label: 'Category Count',
                    data: [10, 15, 7, 12, 5],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500'),
                        documentStyle.getPropertyValue('--orange-500'),
                        documentStyle.getPropertyValue('--cyan-500'),
                        documentStyle.getPropertyValue('--green-500'),
                        documentStyle.getPropertyValue('--purple-500')
                    ]
                }
            ]
        };

        this.pieChartData = {
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
                    ]
                }
            ]
        };

        this.donutChartData = {
            labels: ['Completed', 'In Progress', 'Pending'],
            datasets: [
                {
                    data: [30, 50, 20],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--green-500'),
                        documentStyle.getPropertyValue('--yellow-500'),
                        documentStyle.getPropertyValue('--red-500')
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--green-600'),
                        documentStyle.getPropertyValue('--yellow-600'),
                        documentStyle.getPropertyValue('--red-600')
                    ]
                }
            ]
        };

        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        };
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
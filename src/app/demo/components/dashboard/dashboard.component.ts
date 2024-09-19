import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import { Announcement } from 'src/app/modules/announcement';

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
    subscriptions: Subscription[] = []; // Use an array to manage multiple subscriptions
    notedPercentages: { departmentName: string, percentage: number }[] = [];
    
    constructor(private announcementService: AnnouncementService) {}

    ngOnInit(): void {
        this.fetchAnnouncements();
        this.countAnnouncements();
        this.initChart();
        this.loadPieChartData();
    }

    fetchAnnouncements(): void {
        const subscription = this.announcementService.getAllAnnouncements().subscribe(
            data => {
                this.announcements = data.map(announcement => ({
                    ...announcement,
                    createdAt: this.parseDate(announcement.createdAt)
                }));
                this.updateCharts(this.announcements);
            },
            error => {
                console.error('Error fetching announcements', error);
            }
        );
        this.subscriptions.push(subscription);
    }

    // Improved parseDate method
    parseDate(dateInput: any): Date | null {
        let parsedDate: Date;

        if (Array.isArray(dateInput) && dateInput.length >= 3) {
            parsedDate = new Date(
                dateInput[0],  // year
                dateInput[1] - 1, // month (0-based index)
                dateInput[2],  // day
                dateInput[3] || 0, // hours (default to 0 if not provided)
                dateInput[4] || 0  // minutes (default to 0 if not provided)
            );
        } else {
            // Handle string format or other formats
            parsedDate = new Date(dateInput);
        }

        // Check if the parsed date is valid
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        } else {
            console.warn('Invalid date string:', dateInput);
            return null;
        }
    }

    loadPieChartData(): void {
        const subscription = this.announcementService.getPieChart().subscribe(
            (data: Map<string, BigInt>) => {
                const labels: string[] = [];
                const values: number[] = [];

                // Convert Map to plain arrays
                data.forEach((value, key) => {
                    labels.push(key);                 // Company names (keys)
                    values.push(Number(value));       // Convert BigInt to number
                });

                // Define pie chart data with labels and datasets
                this.pieChartData = {
                    labels: labels,
                    datasets: [
                        {
                            data: values,
                            backgroundColor: this.generateRandomColors(labels.length),
                            hoverBackgroundColor: this.generateHoverColors(labels.length)
                        }
                    ]
                };

                // Updated chart options to ensure no scales and correct legends/tooltip
                this.chartOptions = {
                    plugins: {
                        legend: {
                            position: 'top',  // Position of the legend
                            labels: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (tooltipItem: any) {
                                    return `${tooltipItem.raw}%`;
                                }
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            display: false  // Disable Y-axis (not needed for pie chart)
                        },
                        x: {
                            display: false  // Disable X-axis (optional for pie chart)
                        }
                    }
                };
            },
            (error) => {
                console.error('Error loading pie chart data', error);
            }
        );
        this.subscriptions.push(subscription);
    }

    getNotedPercentageByDepartment() {
        this.announcementService.getNotedPercentageByDepartment().subscribe(data => {
            this.notedPercentages = Object.keys(data).map(key => ({
              departmentName: key,
              percentage: data[key]
            }));
          });
    }


    generateRandomColors(count: number): string[] {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const randomColor = `hsl(${Math.random() * 360}, 100%, 75%)`; // Generate random pastel color
            colors.push(randomColor);
        }
        return colors;
    }

    generateHoverColors(count: number): string[] {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const randomColor = `hsl(${Math.random() * 360}, 100%, 60%)`; // Generate darker shade
            colors.push(randomColor);
        }
        return colors;
    }

    countAnnouncements(): void {
        const subscription = this.announcementService.countAnnouncements().subscribe(
            (count: number) => {
                this.announcementCount = count; // Store the result in the property
            },
            (error) => {
                console.error('Error counting announcements', error);
            }
        );
        this.subscriptions.push(subscription);
    }

    updateCharts(announcements: Announcement[]): void {
        // Update the charts dynamically based on the announcements data
    }

    initChart(): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // Initialize static chart data
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
                    data: [10, 15, 7, 12, 5, 60],
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
            datasets: [
                {
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

        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },

        };
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe()); // Unsubscribe from all subscriptions
    }
}

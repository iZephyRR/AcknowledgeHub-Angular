import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import { Announcement } from 'src/app/modules/announcement';
import { Company } from 'src/app/modules/company';
import { User } from 'src/app/modules/user';
import { CompanyService } from 'src/app/services/company/company.service';
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
    company: Company[] = [];
    employee: User[]=[];
    employeeCount:number;
    companyCount: number;

    constructor(
        private announcementService: AnnouncementService,
        private companyService:CompanyService,
        private userService:UserService
    ) {}

    ngOnInit(): void {
        this.fetchAnnouncements();
        this.countAnnouncements(); // Call the count method on initialization
        this.initChart();
        this.loadPieChartData();
        this.countCompany();
        this.countEmployee();
    }

    fetchAnnouncements(): void {
        this.subscription = this.announcementService.getAllAnnouncements().subscribe(
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
    }

    // Method to parse and validate date
    parseDate(dateInput: any): Date | null {
        let parsedDate: Date;
        if (Array.isArray(dateInput) ) { // && dateInput.length <= 6
            parsedDate = new Date(
                dateInput[0], // year
                dateInput[1] - 1, // month (0-based index)
                dateInput[2], // day
                dateInput[3], // hours
                dateInput[4] // minutes
            );
        } else {
            // Handle string format or other formats
            parsedDate = new Date(dateInput);
        }
        
        // Log the parsed date for debugging
        // console.log('Parsed date:', parsedDate);

        // Check if the parsed date is valid
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        } else {
            console.warn('Invalid date string:', dateInput);
            return null;
        }
    }
    loadPieChartData(): void {
        this.announcementService.getPieChart().subscribe(
            (data: Map<string, BigInt>) => {  // Updated to handle Map<String, BigInt>
                const labels: string[] = [];
                const values: number[] = [];

                // Convert Map to plain arrays
                data.forEach((value, key) => {
                    labels.push(key);                 // Company names (keys)
                    values.push(Number(value));       // Convert BigInt to number
                });

                this.pieChartData = {
                    labels: labels,
                    datasets: [
                        {
                            data: values,
                            // backgroundColor: this.generateRandomColors(labels.length),
                            // hoverBackgroundColor: this.generateHoverColors(labels.length)
                        }
                    ]
                };
                this.chartOptions = {
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem: any) {                                   
                                    return `${tooltipItem.raw}%`;
                                }
                            }
                        }
                    }
                };
            },
            (error) => {
                console.error('Error loading pie chart data', error);
            }
        );
    }

    // Helper methods to generate colors
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
        this.announcementService.countAnnouncements().subscribe(
            (count: number) => {
                this.announcementCount = count; // Store the result in the property
            },
            (error) => {
                console.error('Error counting announcements', error);
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
                    data: [10, 15, 7, 12, 5 ,60],
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
            scales: {
                x: {
                    display: false,
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                },
                y: {
                    //display: false,
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

    countCompany():void{
        this.companyService.countCompany().subscribe(
            {
                next:(data)=>{
                    this.companyCount=data;
                }
            }
        );
    }
    countEmployee():void{
        this.userService.countEmployee().subscribe(
            {
                next:(data)=>{
                    this.employeeCount=data;
                }
            }
        );
    }
}

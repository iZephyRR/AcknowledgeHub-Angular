
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import { Announcement } from 'src/app/modules/announcement';
import { ChartData, ChartOptions } from 'chart.js';
import { UserService } from 'src/app/services/user/user.service';
import { CompanyService } from 'src/app/services/company/company.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  announcementsByMonth: Map<string, Announcement[]> = new Map();
  announcements: Announcement[] = [];
  announcementCount: number = 0; // Property to hold the count
  lineChartData: any;
  barChartData: any;
  selectedYear: number;
  years: { label: string, value: number }[] = [];
  pieChartData: any;
  donutChartData: any;
  chartOptions: any;
  chartOptionsBar: any;
  subscriptions: Subscription[] = []; // Use an array to manage multiple subscriptions
  notedPercentages: { departmentName: string, percentage: number }[] = [];
  dataLoaded: boolean = false;
  allMonths: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  currentMonthPage: number = 0;
  monthsPerPage: number = 6;
  processedData: { [month: string]: number } = {};
  availableYears: number[] = [];
  employeeCount: number;
  companyCount: number;

  constructor(
    private announcementService: AnnouncementService,
    private userService: UserService,
    private companyService: CompanyService
  ) { }

  ngOnInit(): void {
    this.fetchAnnouncements();
    this.countAnnouncements();
    this.loadPieChartData();
    this.countCompany();
    this.countEmployee();
    const currentYear = new Date().getFullYear();
    this.availableYears = Array.from({ length: 5 }, (v, i) => currentYear - i); // Example: 5 recent years
    this.selectedYear = currentYear;
    this.fetchAnnouncementsForYear(this.selectedYear); this.chartOptionsBar = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          display: true,  // Keep x-axis visible
          barPercentage: 0.5,
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
          },
        },
        y: {
          display: true,  // Keep y-axis visible
          beginAtZero: true,
          // Set the maximum value to 100
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
            stepSize: 10, // Optional: Set the step size for the ticks
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
          },
        },
      },
    };
  }



  fetchAnnouncements(): void {
    const subscription = this.announcementService.getAllAnnouncements().subscribe(
      (data) => {
        this.announcements = data.map((announcement) => ({
          ...announcement,
          createdAt: this.parseDate(announcement.createdAt),
        }));
        this.updateCharts(this.announcements);
      },
      (error) => {
        console.error('Error fetching announcements', error);
      }
    );
    this.subscriptions.push(subscription);
  }


  fetchAnnouncementsForYear(year: number): void {
    console.log('Fetching data for year:', year);  // Debugging line
    this.announcementService.getAnnouncementsForMonthly(year).subscribe(
      (data: any) => {
        this.processedData = this.processAnnouncementsData(data);
        console.log('Processed Data:', this.processedData);  // Debugging line
        this.updateBarChart();
      },
      (error) => {
        console.error('Error fetching announcements for the year', error);
      }
    );
  }

  onYearChange(selectedYear: number): void {
    if (selectedYear) {
      console.log('Selected Year:', selectedYear);

      // Fetch the data for the selected year and update the bar chart
      this.fetchAnnouncementsForYear(selectedYear);
    } else {
      console.error('Invalid year selected');
    }
  }


  processAnnouncementsData(data: any): { [month: string]: number } {
    const monthlyData: { [month: string]: number } = {};

    // Assuming the keys in data are formatted as 'YYYY-MM'
    Object.keys(data).forEach((monthYear) => {
      const [year, month] = monthYear.split('-');
      const monthIndex = parseInt(month, 10) - 1;
      const monthName = this.allMonths[monthIndex];  // Get month name from predefined array

      // Count the number of announcements for that month
      monthlyData[monthName] = data[monthYear].length || 0;
    });

    return monthlyData;
  }

  updateBarChart(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const backgroundColors = [
      documentStyle.getPropertyValue('--blue-500'),
      documentStyle.getPropertyValue('--green-500'),
      documentStyle.getPropertyValue('--yellow-500'),
      documentStyle.getPropertyValue('--red-500'),
      documentStyle.getPropertyValue('--orange-500'),
    ];

    // Ensure that months with data come before months without data
    const monthsWithData = this.allMonths.filter(month => this.processedData[month] && this.processedData[month] > 0);
    const monthsWithoutData = this.allMonths.filter(month => !this.processedData[month] || this.processedData[month] === 0);

    const sortedMonths = [...monthsWithData, ...monthsWithoutData];

    // Pagination logic: Define the range for the current page
    const start = this.currentMonthPage * this.monthsPerPage;
    const end = Math.min(start + this.monthsPerPage, sortedMonths.length);  // Ensure the range doesn't exceed the array length

    // Extract data for the current page
    const monthsToShow = sortedMonths.slice(start, end);
    const valuesToShow = monthsToShow.map(month => this.processedData[month] || 0);

    // Check if no months to show, handle empty state if needed
    if (monthsToShow.length === 0) {
      console.warn('No data available for selected months');
      return;  // Don't proceed further
    }

    // Update the chart's data
    this.barChartData = {
      labels: monthsToShow,
      datasets: [
        {
          label: 'Announcements',
          data: valuesToShow,
          backgroundColor: backgroundColors.slice(0, monthsToShow.length),
          borderColor: backgroundColors.slice(0, monthsToShow.length),
          borderWidth: 1,
        },
      ],
    };

    console.log('Months to Show:', monthsToShow);
    console.log('Values to Show:', valuesToShow);
  }



  initBarChart(data: any): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const backgroundColors = [
      documentStyle.getPropertyValue('--blue-500'),
      documentStyle.getPropertyValue('--green-500'),
      documentStyle.getPropertyValue('--yellow-500'),
      documentStyle.getPropertyValue('--red-500'),
      documentStyle.getPropertyValue('--orange-500')
    ];

    // Process the input data into a format suitable for the chart
    const processedData = this.processAnnouncementsData(data);

    // Extract labels (months) and values (counts) for the chart
    const labels = Object.keys(processedData);
    const values = Object.values(processedData);

    // If there's no data, handle the empty state
    if (labels.length === 0 || values.every(value => value === 0)) {
      console.warn('No announcements data available to show on the bar chart.');
      return;
    }

    // Update the bar chart with the processed data
    this.barChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Announcements',
          data: values,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: backgroundColors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };

    console.log('Bar Chart Data:', this.barChartData);  // Log chart data for debugging
  }

  showNextMonths(): void {
    if ((this.currentMonthPage + 1) * this.monthsPerPage < this.allMonths.length) {
      this.currentMonthPage++;
      this.updateBarChart();
    }
  }

  showPreviousMonths(): void {
    if (this.currentMonthPage > 0) {
      this.currentMonthPage--;
      this.updateBarChart();
    }
  }

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

  // initChart(): void {
  //     const documentStyle = getComputedStyle(document.documentElement);
  //     const textColor = documentStyle.getPropertyValue('--text-color');
  //     const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
  //     const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

  //     // Initialize static chart data
  //     this.lineChartData = {
  //         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  //         datasets: [
  //             {
  //                 label: 'Announcements',
  //                 data: [65, 59, 80, 81, 56, 55, 40],
  //                 fill: false,
  //                 borderColor: documentStyle.getPropertyValue('--blue-500'),
  //                 tension: 0.4
  //             }
  //         ]
  //     };

  //     this.barChartData = {
  //         labels: ['Holidays', 'Salary', 'Must Know', 'Office Rules', 'General'],
  //         datasets: [
  //             {
  //                 label: 'Category Count',
  //                 data: [10, 15, 7, 12, 5],
  //                 backgroundColor: [
  //                     documentStyle.getPropertyValue('--blue-500'),
  //                     documentStyle.getPropertyValue('--orange-500'),
  //                     documentStyle.getPropertyValue('--cyan-500'),
  //                     documentStyle.getPropertyValue('--green-500'),
  //                     documentStyle.getPropertyValue('--purple-500')
  //                 ]
  //             }
  //         ]
  //     };

  //     this.pieChartData = {
  //         datasets: [
  //             {
  //                 backgroundColor: [
  //                     documentStyle.getPropertyValue('--blue-500'),
  //                     documentStyle.getPropertyValue('--orange-500'),
  //                     documentStyle.getPropertyValue('--cyan-500'),
  //                     documentStyle.getPropertyValue('--green-500'),
  //                     documentStyle.getPropertyValue('--purple-500')
  //                 ],
  //                 hoverBackgroundColor: [
  //                     documentStyle.getPropertyValue('--blue-600'),
  //                     documentStyle.getPropertyValue('--orange-600'),
  //                     documentStyle.getPropertyValue('--cyan-600'),
  //                     documentStyle.getPropertyValue('--green-600'),
  //                     documentStyle.getPropertyValue('--purple-600')
  //                 ]
  //             }
  //         ]
  //     };

  //     this.chartOptions = {
  //         plugins: {
  //             legend: {
  //                 labels: {
  //                     color: textColor
  //                 }
  //             }
  //         },

  //     };
  // }


  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe()); // Unsubscribe from all subscriptions
  }
  countCompany(): void {
    this.companyService.countCompany().subscribe(
      {
        next: (data) => {
          this.companyCount = data;
        }
      }
    );
  }
  countEmployee(): void {
    this.userService.countEmployee().subscribe(
      {
        next: (data) => {
          this.employeeCount = data;
        }
      }
    );
  }
}

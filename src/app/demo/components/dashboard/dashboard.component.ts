
import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription, switchMap } from 'rxjs';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import { Announcement } from 'src/app/modules/announcement';
import { ChartData, ChartOptions } from 'chart.js';
import { UserService } from 'src/app/services/user/user.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { User } from 'src/app/modules/user';
import { SystemService } from 'src/app/services/system/system.service';

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
  loading: boolean = true;
  users : User[] = [];

  constructor(
    private announcementService: AnnouncementService,
    private userService: UserService,
    private companyService: CompanyService,
    public authService : AuthService,
    public systemService : SystemService
  ) { }

  ngOnInit(): void {
    this.initializeDataFetches();
    this.initializeChartOptions();
    this.initializeYearsDropdown();
  
    const currentYear = new Date().getFullYear();
    this.selectedYear = currentYear;
    
    this.fetchAnnouncementsForYear(this.selectedYear);
    //this.startYearlyAnnouncementsPolling(this.selectedYear);
  }

  initializeDataFetches(): void {
    this.fetchAnnouncements();
    //this.startAnnouncementsPolling();
  
    this.countAnnouncements();
    //this.startCountPolling();

   if (this.authService.role == 'MAIN_HR') {
    this.loadPieChartData();
    //this.startPieChartPolling();
    this.getNotedCount();
    this.startNotedCountPolling();
   }

     this.getNotedPercentageByDepartment();
     //this.startNotedPercentagePolling();
  
    this.countCompany();
    //this.startCompanyPolling();
  
    this.countEmployee();
    this.startEmployeePolling();
  
    const currentYear = new Date().getFullYear();
    this.selectedYear = currentYear;
    this.fetchAnnouncementsForYear(this.selectedYear);
  }

  initializeChartOptions(): void {
    this.chartOptionsBar = {
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
  
  initializeYearsDropdown(): void {
    const currentYear = new Date().getFullYear();
    this.availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);  // Generate a list of the last 5 years
  }
  
  fetchAnnouncements(): void {
    const subscription = this.announcementService.getAllAnnouncements().subscribe(
      (data) => {
        this.announcements = data.map((announcement) => ({
          ...announcement,
          createdAt: this.parseDate(announcement.createdAt),
        }));
      },
      (error) => {
        console.error('Error fetching announcements', error);
      }
    );
    this.subscriptions.push(subscription);
  }

  startAnnouncementsPolling(): void {
    // Poll for announcements every 10 seconds
    const announcementsPollingSubscription = interval(10000).pipe(
      switchMap(() => this.announcementService.getAllAnnouncements())
    ).subscribe(
      (data) => {
        this.announcements = data.map((announcement) => ({
          ...announcement,
          createdAt: this.parseDate(announcement.createdAt),
        }));
      },
      (error) => {
        console.error('Error polling announcements', error);
      }
    );
  
    // Add the subscription to the list for proper cleanup
    this.subscriptions.push(announcementsPollingSubscription);
  }


  fetchAnnouncementsForYear(year: number): void {
    console.log('Fetching data for year:', year);  // Debugging line
  
    // Fetch the data initially
    const subscription = this.announcementService.getAnnouncementsForMonthly(year).subscribe(
      (data: any) => {
        this.processedData = this.processAnnouncementsData(data);
        console.log('Processed Data:', this.processedData);  // Debugging line
        this.updateBarChart();
      },
      (error) => {
        console.error('Error fetching announcements for the year', error);
      }
    );
    this.subscriptions.push(subscription); // Push the subscription for cleanup
  }
  
  startYearlyAnnouncementsPolling(year: number): void {
    // Poll the server every 10 seconds
    const pollingSubscription = interval(10000).pipe(
      switchMap(() => this.announcementService.getAnnouncementsForMonthly(year))
    ).subscribe(
      (data: any) => {
        this.processedData = this.processAnnouncementsData(data);
        console.log('Updated Data for Year:', this.processedData);  // Debugging line
        this.updateBarChart();
      },
      (error) => {
        console.error('Error during polling for year', error);
      }
    );
    
    this.subscriptions.push(pollingSubscription); // Add to subscriptions for cleanup
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
      documentStyle.getPropertyValue('--purple-500'),
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
    this.loading = true;
    const subscription = this.announcementService.getPieChart().subscribe(
      (data: Map<string, BigInt>) => {
        this.loading = false;
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
              backgroundColor: this.generateFixedColors(labels.length),
              //hoverBackgroundColor: this.generateHoverColors(labels.length)
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

  startPieChartPolling(): void {
    // Poll for pie chart data every 1 min
    const pieChartPollingSubscription = interval(30000).pipe(
      switchMap(() => this.announcementService.getPieChart())
    ).subscribe(
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
              backgroundColor: this.generateFixedColors(labels.length),
              //hoverBackgroundColor: this.generateHoverColors(labels.length)
            }
          ]
        };
      },
      (error) => {
        console.error('Error polling pie chart data', error);
      }
    );
  
    this.subscriptions.push(pieChartPollingSubscription); // Store for cleanup
  }

  getNotedPercentageByDepartment(): void {
    this.loading = true;
  // Fetch the noted percentages by department immediately on initialization
  const subscription = this.announcementService.getNotedPercentageByDepartment().subscribe(
    (data) => {
      // Transform the data into an array of departmentName and percentage pairs
      this.notedPercentages = Object.keys(data).map(key => ({
        departmentName: key,
        percentage: data[key]
      }));
      this.loading = false;
    },
    (error) => {
      console.error('Error fetching noted percentages by department', error);
    }
  );
  
  this.subscriptions.push(subscription); // Store the subscription for cleanup
}

startNotedPercentagePolling(): void {
  // Poll for the noted percentages by department every 30s
  const notedPercentagePollingSubscription = interval(30000).pipe(
    switchMap(() => this.announcementService.getNotedPercentageByDepartment())
  ).subscribe(
    (data) => {
      // Transform the data into an array of departmentName and percentage pairs
      this.notedPercentages = Object.keys(data).map(key => ({
        departmentName: key,
        percentage: data[key]
      }));
    },
    (error) => {
      console.error('Error polling noted percentages by department', error);
    }
  );
  
  this.subscriptions.push(notedPercentagePollingSubscription); // Store the polling subscription for cleanup
}

generateFixedColors(count: number): string[] {
  // Define a fixed array of colors, excluding the red family
  const fixedColors: string[] = [
    '#36A2EB', // Blue
    '#FFCE56', // Yellow
    '#4BC0C0', // Teal
    '#9966FF', // Purple
    '#FF9F40', // Orange
    '#8BC34A', // Green
    '#F44336', // Coral (more on the orange side)
    '#607D8B', // Grey-blue
    '#FFEB3B', // Bright Yellow
    '#00BCD4'  // Cyan
  ];

  // Repeat colors if the count exceeds the number of available colors
  return Array(count)
    .fill(null)
    .map((_, index) => fixedColors[index % fixedColors.length]);
}


  generateHoverColors(count: number): string[] {
    const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    let hue: number;
    // Keep generating until we get a hue that is far enough from red
    do {
      hue = Math.random() * 360;
    } while ((hue >= 330 && hue <= 360) || (hue >= 0 && hue <= 30)); // Exclude a broader red range

    const randomColor = `hsl(${hue}, 100%, 60%)`; // Generate color
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

  startCountPolling(): void {
    // Poll for announcement count every 10 seconds
    const countPollingSubscription = interval(10000).pipe(
      switchMap(() => this.announcementService.countAnnouncements())
    ).subscribe(
      (count: number) => {
        this.announcementCount = count; // Update the count with the new data
      },
      (error) => {
        console.error('Error polling announcement count', error);
      }
    );
  
    // Add the polling subscription to the list for proper cleanup
    this.subscriptions.push(countPollingSubscription);
  }

  countCompany(): void {
    // Fetch company count immediately on component load
    const subscription = this.companyService.countCompany().subscribe({
      next: (data) => {
        this.companyCount = data;
      },
      error: (error) => {
        console.error('Error fetching company count', error);
      }
    });
  
    this.subscriptions.push(subscription); // Store the subscription for cleanup
  }
  
  startCompanyPolling(): void {
    // Poll for company count every 10 seconds
    const companyPollingSubscription = interval(10000).pipe(
      switchMap(() => this.companyService.countCompany())
    ).subscribe({
      next: (data) => {
        this.companyCount = data;
      },
      error: (error) => {
        console.error('Error polling company count', error);
      }
    });
  
    this.subscriptions.push(companyPollingSubscription); // Store for cleanup
  }

  countEmployee(): void {
    // Fetch employee count immediately on component load
    const subscription = this.userService.countEmployee().subscribe({
      next: (data) => {
        this.employeeCount = data;
      },
      error: (error) => {
        console.error('Error fetching employee count', error);
      }
    });
  
    this.subscriptions.push(subscription); // Store the subscription for cleanup
  }
  
  startEmployeePolling(): void {
    // Poll for employee count every 10 seconds
    const employeePollingSubscription = interval(10000).pipe(
      switchMap(() => this.userService.countEmployee())
    ).subscribe({
      next: (data) => {
        this.employeeCount = data;
      },
      error: (error) => {
        console.error('Error polling employee count', error);
      }
    });
  
    this.subscriptions.push(employeePollingSubscription); // Store for cleanup
  }

  startNotedCountPolling() : void {
    const notedCountPollingsubscription = interval(30000).pipe(
      switchMap(() => this.userService.getNotedCount())
    ).subscribe({
      next:(data: User[]) => {
        this.users = data.map(user =>({
          ...user,
          profileImage : user.photoLink ? `data:image/png;base64,${user.photoLink}` : null
        }))
      }
    });
    this.subscriptions.push(notedCountPollingsubscription);
  }

  getNotedCount() : void {
    const subscription = this.userService.getNotedCount().subscribe({
      next:(data : User[]) => {
        this.users = data.map(user =>({
          ...user,
          profileImage : user.photoLink ? `data:image/png;base64,${user.photoLink}` : null
        }))
      }
    });
    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe()); // Unsubscribe from all subscriptions
  }

}

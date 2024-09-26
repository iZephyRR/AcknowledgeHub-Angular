import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { interval, Subscription, switchMap } from 'rxjs';
import { ScheduleList } from 'src/app/modules/announcement';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import { MessageDemoService } from 'src/app/services/message/message.service';

@Component({
  templateUrl: './inputdemo.component.html'
})
export class InputDemoComponent implements OnInit, OnDestroy {
  groupedAnnouncements = [];
  //scheduleLists = signal([] as ScheduleList[]); // Signal for reactive list
  pollingSubscription: Subscription;

  constructor(
    private announcementService: AnnouncementService,
    private messageService: MessageDemoService
  ) {}

  ngOnInit(): void {
    this.fetchInitialData();
    this.startPolling();
  }

  fetchInitialData() {
    this.announcementService.getScheduleList().subscribe(data => {
      this.groupAnnouncementsByDate(data);
    }, error => {
      this.messageService.toast("error", "Failed to load announcements");
    });
  }

  startPolling() {
    // Poll the server every 10 seconds
    this.pollingSubscription = interval(10000).pipe(
      switchMap(() => this.announcementService.getScheduleList())
    ).subscribe(data => {
      this.groupAnnouncementsByDate(data); // Group the fetched data
    });
  }

  // Function to process and group announcements by date
  groupAnnouncementsByDate(data: any) {
    const groupMap = new Map<string, { date: Date, announcements: any[] }>();
    console.log("Original list: ", data);
    
    const parsedAnnouncements = data.map((announcement: any) => {
      const createdAt = this.parseDate(announcement.createdAt);
      
      if (!createdAt) {
        console.warn('Skipping announcement with invalid date:', announcement);
        return null;
      }

      return {
        ...announcement,
        createdAt: createdAt,
        countdown: this.calculateCountdown(createdAt) // Calculate countdown after parsing date
      };
    }).filter(Boolean); // Filter out null values

    parsedAnnouncements.forEach(announcement => {
      const dateKey = announcement.createdAt.toISOString().split('T')[0]; // Group by day
      if (!groupMap.has(dateKey)) {
        groupMap.set(dateKey, { date: announcement.createdAt, announcements: [] });
      }
      groupMap.get(dateKey)?.announcements.push(announcement);
    });

    // Convert Map to Array and sort by date
    this.groupedAnnouncements = Array.from(groupMap.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    console.log("Grouped Announcements: ", this.groupedAnnouncements);
  }

  // Unsubscribe from polling when component is destroyed
  ngOnDestroy() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  // Helper function to calculate countdown
  calculateCountdown(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('Invalid date for countdown:', date);
      return 'Invalid date';
    }

    const now = new Date().getTime();
    const eventTime = date.getTime();
    const timeDiff = eventTime - now;

    if (timeDiff <= 0) {
      return 'Event has passed';
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  }

  // Helper function to parse date inputs
  parseDate(dateInput: any): Date | null {
    if (!dateInput) {
      console.warn('Date input is null or undefined:', dateInput);
      return null;
    }

    let parsedDate: Date;

    if (Array.isArray(dateInput)) {
      parsedDate = new Date(
        dateInput[0],
        dateInput[1] - 1, // Month is zero-indexed
        dateInput[2],
        dateInput[3] || 0,
        dateInput[4] || 0
      );
    } else {
      parsedDate = new Date(dateInput);
    }

    if (isNaN(parsedDate.getTime())) {
      console.warn('Invalid date string:', dateInput);
      return null;
    }

    return parsedDate;
  }

  // Delete schedule method
  deleteSchedule(announcementId: number) {
    console.log("Deleting announcement: ", announcementId);
    this.announcementService.deleteScheduleAnnoucement(announcementId).subscribe({
      next: (response) => {
        this.messageService.toast("success", response.STRING_RESPONSE);
        this.refreshScheduleList(); // Fetch and group data again
      },
      error: (error: any) => {
        this.messageService.toast("error", "Something went wrong");
      }
    });
  }

  // Upload now method
  uploadNow(announcementId: number) {
    console.log("Uploading now: ", announcementId);
    this.announcementService.uploadNow(announcementId).subscribe({
      next: (response) => {
        this.messageService.toast("success", response.STRING_RESPONSE);
        this.refreshScheduleList(); // Fetch and group data again
      },
      error: (error: any) => {
        this.messageService.toast("error", "Something went wrong");
      }
    });
  }

  // Method to refresh the schedule list and re-group
  refreshScheduleList() {
    this.announcementService.getScheduleList().subscribe(data => {
      this.groupAnnouncementsByDate(data);
    });
  }
}

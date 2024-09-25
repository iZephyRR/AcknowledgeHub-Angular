import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription, switchMap } from 'rxjs';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MessageDemoService } from 'src/app/services/message/message.service';

@Component({
  selector: 'app-announcementreport',
  templateUrl: './announcementreport.component.html',
  styleUrls: ['./announcementreport.component.scss']
})
export class AnnouncementreportComponent implements OnInit, OnDestroy {
  groupedAnnouncements: any[] = [];
  pollingSubscription: Subscription;

  constructor(
    private announcementService: AnnouncementService,
    private messageService: MessageDemoService,
    public authService : AuthService,
    private route : Router
  ) {}

  ngOnInit(): void {
    this.fetchInitialData();
    this.startPolling();
  }

  fetchInitialData() {
    this.announcementService.getAnnouncementReport().subscribe(data => {
      this.groupAnnouncementsByDate(data);
    }, error => {
      this.messageService.toast('error', 'Failed to load announcements');
    });
  }

  startPolling() {
    // Poll the server every 10 seconds
    this.pollingSubscription = interval(10000).pipe(
      switchMap(() => this.announcementService.getAnnouncementReport())
    ).subscribe(data => {
      this.groupAnnouncementsByDate(data);
    });
  }

  groupAnnouncementsByDate(data: any) {
    const groupMap = new Map<string, { date: Date, announcements: any[] }>();

    const parsedAnnouncements = data.map((announcement: any) => {
      const createdAt = this.parseDate(announcement.createdAt);
      console.log("select all : ", announcement.selectAll);
      if (!createdAt) {
        console.warn('Skipping announcement with invalid date:', announcement);
        return null;
      }

      return {
        ...announcement,
        createdAt: createdAt,
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
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
  }

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

  ngOnDestroy() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  showDetails(id: number) {
    this.route.navigate(['/announcement-page', id]);
  }

  getAnnounceTo (id : number) {
    this.announcementService.getTargetByAnnouncementId(id)
  }
}

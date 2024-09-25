import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { Announcement, FileType } from 'src/app/modules/announcement';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';

@Component({
  templateUrl: './mediademo.component.html',
  styleUrls: ['./mediademo.component.scss']
})
export class MediaDemoComponent implements OnInit {
  @ViewChild('filter') filter!: ElementRef;
  announcements: Announcement[] = [];
  displayModal: boolean = false;
  currentPdfLink: SafeResourceUrl;
  FileType = FileType;
  displayDialog: boolean = false;
  selectedAnnouncement: Announcement | null = null;
  
  timeRangeOptions: any[] = [];
  selectedTimeRange: string;
  displayCustomDialog: boolean = false;

  // Variables to hold custom date and time inputs
  customDay: string = '0';
  customHour: string = '0';
  customMinute: string = '0';

  // Comments handling
  comments: Array<{ author: string, text: string, showReplyBox?: boolean, replyText?: string, replies?: { author: string, text: string }[] }> = [];
  newComment: string = '';
  showModal: boolean = false;
  data: any[] = [];

  constructor(
    private announcementService: AnnouncementService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.announcementService.getPreviewByCompany().subscribe(
      (data) => {
        console.log('Fetched announcements:', data);
        data = data.map((data) => {
          data.createdAt = new Date(data.createdAt).toLocaleDateString();
          return data;
        })
        this.announcements = data;
      },
      (error) => {
        console.error('Error fetching announcements:', error);
      }
    );
    this.timeRangeOptions = [
      { label: '1 Hour', value: '1 Hour' },
      { label: '1 Day', value: '1 Day' },
      { label: '1 Week', value: '1 Week' },
      { label: 'Custom', value: 'Custom' }
    ];
  }
 
   onTimeRangeChange(event: any) {
    const selectedValue = event.value;
    if (selectedValue === 'Custom') {
      this.displayCustomDialog = true;  // Show the custom time picker dialog
    } else {
      this.applyTimeRange(selectedValue);
    }
  }

  applyTimeRange(timeRange: string) {
    console.log(`Applying time range: ${timeRange}`);
    // Add logic for predefined ranges
  }

  submitCustomTime() {
    if (this.customDay && this.customHour && this.customMinute) {
      alert(`Selected date and time: ${this.customDay.padStart(2, '0')} ${this.customHour.padStart(2, '0')}:${this.customMinute.padStart(2, '0')}`);
      this.displayCustomDialog = false;  // Close the dialog after submission
    } else {
      alert('Please enter day, hour, and minutes.');
    }
  }

  // Validation for Day (between 0 and 365)
  validateDay() {
    const day = parseInt(this.customDay);
    if (isNaN(day) || day < 0 || day > 365) {
      this.customDay = '0';  // Reset to 0 if out of range
    }
  }

  // Validation for Hour (between 0 and 23)
  validateHour() {
    const hour = parseInt(this.customHour);
    if (isNaN(hour) || hour < 0 || hour > 23) {
      this.customHour = '0';  // Reset to 0 if out of range
    }
  }

  // Validation for Minute (between 0 and 59)
  validateMinute() {
    const minute = parseInt(this.customMinute);
    if (isNaN(minute) || minute < 0 || minute > 59) {
      this.customMinute = '0';  // Reset to 0 if out of range
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(filterValue, 'contains');
  }
  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }
  showDetails(id: number) {
    this.router.navigate(['/announcement-page', id]);
  }

}

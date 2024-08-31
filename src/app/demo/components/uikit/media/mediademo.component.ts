import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Table } from 'primeng/table';
import { Announcement } from 'src/app/modules/announcement';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';

@Component({
  templateUrl: './mediademo.component.html'
})
export class MediaDemoComponent implements OnInit {

  announcements: Announcement[] = [];
  displayModal: boolean = false;
  currentPdfLink: SafeResourceUrl;
  

  

  constructor(private announcementService: AnnouncementService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.announcementService.getAllAnnouncements().subscribe(
      (data) => {
        console.log('Fetched announcements:', data);
        this.announcements = data;
      },
      (error) => {
        console.error('Error fetching announcements:', error);
      }
    );
  }
  onGlobalFilter(table: Table, event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(filterValue, 'contains');
  }

  showPdf(pdfLink: string) {
    this.currentPdfLink = this.sanitizer.bypassSecurityTrustResourceUrl(pdfLink);
    this.displayModal = true;
  }
 

}

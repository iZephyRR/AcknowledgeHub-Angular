import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { Announcement, FileType } from 'src/app/modules/announcement';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';

@Component({
  templateUrl: './mediademo.component.html'
})
export class MediaDemoComponent implements OnInit {

  announcements: Announcement[] = [];
  displayModal: boolean = false;
  currentPdfLink: SafeResourceUrl;
  FileType = FileType;
  displayDialog: boolean = false;
  selectedAnnouncement: Announcement | null = null;
  
  // Comments handling
  comments: Array<{ author: string, text: string, showReplyBox?: boolean, replyText?: string, replies?: {author: string, text: string}[] }> = [];
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
  showDetails(id: number) {
  this.router.navigate(['/announcement-page',id]);
  }

}

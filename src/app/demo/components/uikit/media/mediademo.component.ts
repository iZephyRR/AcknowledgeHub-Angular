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

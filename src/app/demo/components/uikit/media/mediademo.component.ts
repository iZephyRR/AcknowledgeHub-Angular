import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
    private sanitizer: DomSanitizer
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
  showDetails(announcement: Announcement) {
    this.selectedAnnouncement = announcement;
    
    // Initialize fake comments for demonstration
    this.comments = [
      { author: 'Alice', text: 'Great announcement!', replies: [], showReplyBox: false },
      { author: 'Bob', text: 'Thanks for sharing!', replies: [], showReplyBox: false }
    ];

    this.displayDialog = true;
  }

  onDialogHide(): void {
    this.selectedAnnouncement = null;
  }

  // Open the modal for adding a comment
  openModal() {
    this.showModal = true;
  }

  // Add a new comment to the selected announcement
  addComment() {
    if (this.newComment.trim()) {
      this.comments.push({
        author: 'User', // Hardcoded for now, replace with actual user logic
        text: this.newComment,
        replies: [],
        showReplyBox: false
      });
      this.newComment = ''; // Clear the input field after adding the comment
    }
    this.showModal = false; // Close the modal after adding the comment
  }

  // Clear the comment input
  clearComment() {
    this.newComment = ''; // Clear the input field
    this.showModal = false; // Close the modal
  }

  // Toggle the reply box visibility for a specific comment
  toggleReply(index: number) {
    this.comments[index].showReplyBox = !this.comments[index].showReplyBox;
  }

  // Add a reply to a specific comment
  addReply(index: number) {
    const replyText = this.comments[index].replyText?.trim();
    if (replyText) {
      this.comments[index].replies?.push({
        author: 'User', // Hardcoded for now, replace with actual user logic
        text: replyText
      });
      this.comments[index].replyText = ''; // Clear the reply input after adding the reply
      this.comments[index].showReplyBox = false; // Hide the reply box
    }
  }

  // Cancel the reply action
  cancelReply(index: number) {
    this.comments[index].replyText = ''; // Clear the reply input
    this.comments[index].showReplyBox = false; // Hide the reply box
  }
  
}

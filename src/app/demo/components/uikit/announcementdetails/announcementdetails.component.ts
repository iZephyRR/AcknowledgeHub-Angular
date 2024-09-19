import { Component, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Announcement } from 'src/app/modules/announcement';
import { Comment } from 'src/app/modules/comment';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CommentService } from 'src/app/services/comment/comment.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-announcement-details',
  templateUrl: './announcementdetails.component.html',
})
export class AnnouncementDetailsComponent implements OnInit {
  announcement: Announcement;
  private routerSubscription: Subscription;
  showModal: boolean = false;
  newComment: string = '';
  //comments: { author: string; text: string }[] = [];
  data: any[] = [];
  comments = signal ([] as Comment[]);
  safePdfLink: SafeResourceUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private announcementService: AnnouncementService,
    private commentService: CommentService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.getAnnouncements();
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getAnnouncements();
      }
    });
  }

  getAnnouncements(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.announcementService.getAnnouncementById(id).subscribe({
        next: (data: Announcement) => {
          console.log("anno " + JSON.stringify(data));
          this.announcement = {
            ...data,
            createdAt: this.parseDate(data.createdAt) // Directly modify the createdAt property
          };
          this.safePdfLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.announcement.pdfLink);
          if (this.announcement.contentType === 'EXCEL') {
            const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(this.announcement.pdfLink)}&embedded=true`;
            this.safePdfLink = this.sanitizer.bypassSecurityTrustResourceUrl(googleViewerUrl);
          }
        },
        error: (err) => {
         this.authService.showNotFoundPage();
          console.error('Error fetching announcement details:', err);
        },
      });
    }
  }

  parseDate(dateInput: any): Date | null {
    let parsedDate: Date;
    if (Array.isArray(dateInput)) { // && dateInput.length <= 6
      parsedDate = new Date(
        dateInput[0], // year
        dateInput[1] - 1, // month (0-based index)
        dateInput[2], // day
        dateInput[3], // hours
        dateInput[4] // minutes
      );
    } else {
      parsedDate = new Date(dateInput);
    }
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    } else {
      console.warn('Invalid date string:', dateInput);
      return null;
    }
  }

  openModal() {
    this.showModal = true;
    this.getComments();
  }

  addComment(announcementId: number) {
    if (this.newComment.trim()) {
      // Create the comment object using the Comment model
      const comment: Comment = {
        //author : this.authService.userId,
        content: this.newComment,
        announcementId: announcementId  // Set the actual announcement ID
      };

      // Call the CommentService to add the comment
      this.commentService.addComment(comment).subscribe({
        next: (response) => {
          console.log('Comment added:', response);
          // Optionally add the comment to the local comments array
         this.getComments();
          this.newComment = ''; // Clear the input field
        },
        error: (err) => {
          console.error('Error adding comment:', err);
        }
      });
    }
  }

  getComments() {
    const id = this.route.snapshot.paramMap.get('id');
    this.commentService.getCommentsByAnnouncement(id).subscribe({
      next: (data) => {
        console.log("comments: ", data);
        this.comments.set( data.map(comment => ({
          ...comment,
          createdAt: this.parseDate(comment.createdAt),
          safePhotoLink: this.sanitizer.bypassSecurityTrustUrl(`data:image/jpeg;base64,${comment.photoLink}`)
        })));
      },
      error: (err) => {
        console.error('Error fetching comment:', err);
      }
    });
  }

  clearComment() {
    this.newComment = '';
  }

}





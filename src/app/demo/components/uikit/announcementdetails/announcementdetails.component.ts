import { Component, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AnnouncementResponseCondition } from 'src/app/constants';
import { Announcement } from 'src/app/modules/announcement';
import { Comment, CommentList } from 'src/app/modules/comment';
import { Reply, ReplyList } from 'src/app/modules/reply';

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
  condition: AnnouncementResponseCondition;
  replyText : string ='';
  data: any[] = [];
  comments = signal ([] as CommentList  []);
  replies = signal ([] as ReplyList[]);
  safePdfLink: SafeResourceUrl;
  activeReplyBoxId: number | null = null;

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
          this.condition = this.announcement.announcementResponseCondition;
          if (this.announcement.contentType != 'EXCEL') {
            this.safePdfLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.announcement.pdfLink);
          }else{
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
        content: this.newComment,
        announcementId: announcementId
      };

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

  submitReply (commentId : number) {
    console.log(this.replyText , commentId);
    if (this.replyText.trim()) {
      const reply : Reply = {
        content: this.replyText,
        commentId: commentId
      };
      this.commentService.replyTo(reply).subscribe({
        next: (response) => {
          this.getComments();
          this.getReply(commentId);
          this.replyText= '';
        },
        error: (err) => {
          console.error('Error reply comment:', err);
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
    this.activeReplyBoxId = null;
  }
  
  toggleReplyBox(commentId: number | null): void {
    if (this.activeReplyBoxId === commentId) {
      this.activeReplyBoxId = null; // Close the reply box if the same one is clicked again
    } else {
      this.activeReplyBoxId = commentId;
      this.getReply(commentId);
    }
  }

  getReply(commentId: number) {
    this.commentService.getReply(commentId).subscribe({
      next: (data) => {
        console.log("reply: ", data);
        this.replies.set(data.map(reply => ({
          ...reply,
          replyCreatedAt: this.parseDate(reply.replyCreatedAt),
          safePhotoLink: this.sanitizer.bypassSecurityTrustUrl(`data:image/jpeg;base64,${reply.replierPhotoLink}`)
        })));
      },
      error: (err) => {
        console.error('Error fetching comment:', err);
      }
    });
  }
  

  
}





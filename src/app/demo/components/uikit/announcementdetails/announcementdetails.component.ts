import { Component, OnInit } from '@angular/core';
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
  announcement: Announcement[] = [];
  private routerSubscription: Subscription;
  showModal: boolean = false;
  newComment: string = '';
  //comments: { author: string; text: string }[] = [];
  data: any[] = []; 
  comments : Comment[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private announcementService: AnnouncementService,
    private commentService : CommentService,
    private authService : AuthService
  ) {}

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
      this.announcementService.getAnnouncementsById(id).subscribe({
        next: (data) => {
          this.announcement = data;
          console.log(this.announcement);
          
        },
        error: (err) => {
          console.error('Error fetching announcement details:', err);
        },
      });
    }
  }

   openModal() {
    this.showModal = true;
  }

  addComment(announcementId : number) {
    if (this.newComment.trim()) {
      // Create the comment object using the Comment model
      const comment: Comment = {
        author : this.authService.userId,
        content: this.newComment,
        announcementId: announcementId  // Set the actual announcement ID
      };

      // Call the CommentService to add the comment
      this.commentService.addComment(comment).subscribe({
        next: (response) => {
          console.log('Comment added:', response);
          // Optionally add the comment to the local comments array
          this.comments.push(response);
          this.newComment = ''; // Clear the input field
        },
        error: (err) => {
          console.error('Error adding comment:', err);
        }
      });
    }
  }

  clearComment() {
    this.newComment = ''; 
  }

 
}





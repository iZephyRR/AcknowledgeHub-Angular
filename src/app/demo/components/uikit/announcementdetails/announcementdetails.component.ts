import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Announcement } from 'src/app/modules/announcement';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
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
  comments: { author: string; text: string }[] = [];
  data: any[] = []; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private announcementService: AnnouncementService
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

  addComment() {
    if (this.newComment.trim()) {
      this.comments.push({
        author: 'User', 
        text: this.newComment
      });
      this.newComment =''; 
    }
  }

  clearComment() {
    this.newComment = ''; 
  }

 
}





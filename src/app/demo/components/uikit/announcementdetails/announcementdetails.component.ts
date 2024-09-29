import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FileUpload } from 'primeng/fileupload';
import { Subscription } from 'rxjs';
import { AnnouncementResponseCondition } from 'src/app/constants';
import { Announcement } from 'src/app/modules/announcement';
import { Comment, CommentList } from 'src/app/modules/comment';
import { Reply, ReplyList } from 'src/app/modules/reply';

import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CommentService } from 'src/app/services/comment/comment.service';
import { MessageDemoService } from 'src/app/services/message/message.service';
import { SystemService } from 'src/app/services/system/system.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-announcement-details',
  templateUrl: './announcementdetails.component.html',
  styleUrl: './announcementdetails.component.scss'
})
export class AnnouncementDetailsComponent implements OnInit {
  announcement: Announcement;
  private routerSubscription: Subscription;
  showModal: boolean = false;
  newComment: string = '';
  condition: AnnouncementResponseCondition;
  replyText: string = '';
  data: any[] = [];
  comments = signal([] as CommentList[]);
  replies = signal([] as ReplyList[]);
  safePdfLink: SafeResourceUrl;
  activeReplyBoxId: number | null = null;
  displayNewVersionModal : boolean = false;
  title: string = '';
  isEmailSelected: boolean = false;
  showDeadlineDate: boolean = false;
  deadlineDate: Date = new Date();
  filename: string = '';
  file: File;
  filePreview: string | ArrayBuffer | null = null;
 
  @ViewChild('fileUploader') fileUploader: FileUpload;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService : UserService,
    public announcementService: AnnouncementService,
    private commentService: CommentService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private systemService : SystemService,
    private messageService : MessageDemoService
  ) { }

  ngOnInit(): void {
    console.log(this.authService.afterLoginRout);
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getAnnouncements();
      }
    });
    this.authService.check(['ADMIN', 'HR', 'HR_ASSISTANCE', 'MAIN_HR', 'MAIN_HR_ASSISTANCE', 'STAFF']).subscribe({
      next: (data: boolean) => {
        if (data) {
          this.getAnnouncements();
        } else {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  getAnnouncements(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.announcementService.getAnnouncementById(id).subscribe({
        next: (data: Announcement) => {
          console.log("announcement : ", data);
          this.announcement = {
            ...data,
            createdAt: this.parseDate(data.createdAt),
            profileImage : data.photoLink ? `data:image/png;base64,${data.photoLink}` : undefined,
          };
          this.condition = this.announcement.announcementResponseCondition;
          if (this.announcement.contentType != 'EXCEL') {
            this.safePdfLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.announcement.pdfLink);
          } else {
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

  newVersionModel (title : string, id: number) {
    this.displayNewVersionModal = true;
    let version;
    this.announcementService.nextVersion(id).subscribe({
      next : (nextVersion) => {
        version = nextVersion.STRING_RESPONSE;
      },
      complete:()=>{
        console.log("version : ", version);
        this.title = title + ' Version - '+version;
      }
    });
   
  }

  showReport(): void {
    this.announcementService.showNotedReport = true;
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

  submitReply(commentId: number) {
    console.log(this.replyText, commentId);
    if (this.replyText.trim()) {
      const reply: Reply = {
        content: this.replyText,
        commentId: commentId
      };
      this.commentService.replyTo(reply).subscribe({
        next: (response) => {
          this.getComments();
          this.getReply(commentId);
          this.replyText = '';
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
        this.comments.set(data.map(comment => ({
          ...comment,
          createdAt: this.parseDate(comment.createdAt),
          safePhotoLink: comment.photoLink ? 
          this.sanitizer.bypassSecurityTrustUrl(`data:image/jpeg;base64,${comment.photoLink}`) : null
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
          safePhotoLink: reply.replierPhotoLink ? this.sanitizer.bypassSecurityTrustUrl(`data:image/jpeg;base64,${reply.replierPhotoLink}`) : null
        })));
      },
      error: (err) => {
        console.error('Error fetching comment:', err);
      }
    });
  }

  onUpload(event: any) {
    console.log('event ', event);
    if (event && event.files && event.files.length > 0) {
      const file = event.files[0]; // Get the first uploaded file
      console.log('file ', file);
      console.log('fileType ', file.type);


      this.file = file;
      this.filename = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreview = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      console.error('No file selected');
    }
  }

  ngAfterViewInit() {
    if (this.fileUploader) {
      
    }
  }

  onClear(): void {
    console.log("this.file = null");
    this.file = null;
    this.fileUploader.clear();
  }

  newVersionCreate(form : NgForm, oldVersion : number) {
    this.systemService.showProgress('Uploading New Announcement Version...', true, false, 10);
    const formData = new FormData();
    formData.append("title", this.title);
    formData.append('file', this.file);
    formData.append('filename', this.filename);
    if (this.isEmailSelected) {
      formData.append("isEmailSelected", 'emailSelected');
    } else {
      formData.append("isEmailSelected", 'noEmailSelected');
    }
    formData.append('deadline',new Date(this.deadlineDate).toISOString());
    console.log("oldVersion : ", oldVersion);
    formData.append('oldVersion', oldVersion.toString());    
    this.announcementService.createVersion(formData).subscribe({
      complete: () => {
        this.systemService.stopProgress().then((data) => {
          this.messageService.toast("success", "Announcement Created");
          let image = null;
          if(this.userService.profileImage == null) {
            image = "assets/default-profile.png";
          } else {
            image = this.userService.profileImage;
          }
          let companyName = this.userService.companyName;
          this.messageService.sentWindowNotification("New Announcement Create",{body:'Accouncement Created by '+ companyName ,icon:image}); 
        });
      },
      error: () => {
        this.systemService.stopProgress("ERROR").then((error) => {
          this.messageService.toast("error", "Can't Create");
        });
      }
    });
    this.resetForm(form);
    this.displayNewVersionModal = false;
  }

  resetForm(form: NgForm): void {
    form.reset();
  }



}





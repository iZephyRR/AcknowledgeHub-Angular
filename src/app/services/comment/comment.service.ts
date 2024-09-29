import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CommentList } from 'src/app/modules/comment';
import { Reply, ReplyList } from 'src/app/modules/reply';


@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private apiUrl = 'http://localhost:8080/api/v1/comments';  // Base URL for your Spring Boot API

  constructor(private http: HttpClient) { }

  // Method to add a comment
  addComment(comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/add`, comment);
  }

  getCommentsByAnnouncement(announcementId: string): Observable<CommentList[]> {
    return this.http.get<CommentList[]>(`${this.apiUrl}/getById/${announcementId}`);
  }

  replyTo(reply : Reply):Observable<Reply> {
    return this.http.post<Reply>(`${this.apiUrl}/replyToComment`,reply);
  }

  getReply(commentId: number) : Observable<ReplyList[]> {
    return this.http.get<ReplyList[]> (`${this.apiUrl}/getReplyBy/${commentId}`);
  }

  

}
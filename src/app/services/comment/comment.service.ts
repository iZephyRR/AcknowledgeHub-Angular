import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CommentList } from 'src/app/modules/comment';


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

  // Other methods (e.g., getComments, deleteComment) can be added here as needed
}
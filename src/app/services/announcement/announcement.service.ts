import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Announcement } from 'src/app/modules/announcement';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  private baseUrl = 'http://localhost:8080/api/v1/announcement'; 

  constructor(private http : HttpClient,
    private authService : AuthService
  ) { }

  createAnnouncement (announcement : FormData) : Observable<Announcement> {
    const token  = this.authService.getToken();
    const headers = new HttpHeaders({
      'CONTENT_TYPE' : 'application/json',
      'Authorization':  `Bearer ${token}` 
    });
    return this.http.post<Announcement>(`${this.baseUrl}/create`, announcement , {headers});
  }


}

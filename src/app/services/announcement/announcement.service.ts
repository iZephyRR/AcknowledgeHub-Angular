import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Announcement } from 'src/app/modules/announcement';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {

  private baseUrl = 'http://localhost:8080/api/v1/announcement';

  constructor(private http : HttpClient,
    private authService : AuthService
  ) { }

  createAnnouncement (announcement : FormData) : Observable<Announcement> {
    return this.http.post<Announcement>(`${this.baseUrl}/create`, announcement);
  }

  getAllAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.baseUrl}/get-all`);
  }

  // Fetch announcements for August to October 2024
  getAnnouncementsForAugToOct2024(): Observable<Map<string, Announcement[]>> {
    return this.http.get<Map<string, Announcement[]>>(`${this.baseUrl}/aug-to-oct-2024`);
  }


}

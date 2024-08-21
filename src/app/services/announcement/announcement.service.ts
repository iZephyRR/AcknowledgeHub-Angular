import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Announcement } from 'src/app/modules/announcement';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private baseUrl = 'http://localhost:8080/api/v1/announcement';

  constructor(private http: HttpClient) {}

  // Fetch announcements for August to October 2024
  getAnnouncementsForAugToOct2024(): Observable<Map<string, Announcement[]>> {
    return this.http.get<Map<string, Announcement[]>>(`${this.baseUrl}/aug-to-oct-2024`);
  }
}

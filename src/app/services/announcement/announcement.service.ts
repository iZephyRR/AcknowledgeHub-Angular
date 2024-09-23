import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Announcement, ScheduleList } from 'src/app/modules/announcement';
import { Draft } from 'src/app/modules/draft';
import { PaginationResponse } from 'src/app/modules/pagination';
import { User } from 'src/app/modules/user';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private baseUrl = 'http://localhost:8080/api/v1/announcement';

  constructor(private http: HttpClient, private authService: AuthService) { }

  createAnnouncement(announcement: FormData): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.baseUrl}/create`, announcement);
  }

  // Fetch all announcements
  getAllAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.baseUrl}/get-all`);
  }

  getPreviewByCompany(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.baseUrl}/get-by-company`);
  }

  getMainPreview(page:number): Observable<PaginationResponse<{ id: number, label: string }>> {
    return this.http.get<PaginationResponse<{ id: number, label: string }>>(`${this.baseUrl}/get-main-previews?page=${page}`);
  }

  getSubPreview(page:number): Observable<PaginationResponse<{ id: number, label: string }>> {
    return this.http.get<PaginationResponse<{ id: number, label: string }>>(`${this.baseUrl}/get-sub-previews?page=${page}`);
  }

  //fetch all announcements for companyid
  getAllAnnouncementsWithCompanyId(id: string): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.baseUrl}/getAnnouncementsByCompanyId`);
  }

  //fetch all announcements for individual employee
  getAnnouncementsForEmployee(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.baseUrl}/get-By-EmployeeId`);
  }

  getAnnouncementById(id: string): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.baseUrl}/${id}`);
  }

  //fetch all announcements for departmentid
  getAllAnnouncementsWithDepartmentId(id: string): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.baseUrl}/getAnnouncementsByDepartmentId`);
  }

  // Fetch announcements for August to October 2024
  getAnnouncementsForAugToOct2024(): Observable<Map<string, Announcement[]>> {
    return this.http.get<Map<string, Announcement[]>>(`${this.baseUrl}/aug-to-oct-2024`);
  }

  // Custom group data...

  // save draft
  saveDraft(draft: FormData): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.baseUrl}/uploadDraft`, draft);
  }

  getDrafts(): Observable<Draft[]> {
    return this.http.get<Draft[]>(`${this.baseUrl}/get-drafts`);
  }

  getDraftById(draftId: number): Observable<Draft> {
    return this.http.get<Draft>(`${this.baseUrl}/getDraftById/${draftId}`);
  }

  deleteDraft(draftId: number): Observable<String> {
    return this.http.delete<String>(`${this.baseUrl}/delete-draft/${draftId}`);
  }

  countAnnouncements(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`); // Adjust the endpoint as necessary
  }

  getPieChart(): Observable<Map<string, BigInt>> {
    return this.http.get<{ [key: string]: BigInt }>(`${this.baseUrl}/pieChart`).pipe(
      map(data => {
        const map = new Map<string, BigInt>();
        Object.entries(data).forEach(([key, value]) => {
          map.set(key, value);
        });
        return map;
      })
    );
  }

  getNotedPercentageByDepartment(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.baseUrl}/getNotedPercentageByDepartment`);
  }

  getScheduleList(): Observable<ScheduleList[]> {
    return this.http.get<ScheduleList[]>(`${this.baseUrl}/getScheduleList`);
  }

  deleteScheduleAnnoucement(announcementId: number): Observable<{ STRING_RESPONSE: string }> {
    return this.http.delete<{ STRING_RESPONSE: string }>(`${this.baseUrl}/deleteScheduleAnnouncement/${announcementId}`);
  }

  uploadNow(announcementId: number): Observable<{ STRING_RESPONSE: string }> {
    return this.http.get<{ STRING_RESPONSE: string }>(`${this.baseUrl}/updateNow/${announcementId}`);
  }

  getUserWhoNotedWithInOneDay(announcementId : string,min:number) : Observable<User[]> {
    return this.http.get<User[]> (`${this.baseUrl}/get-noted-in?id=${announcementId}&min=${min}`);
  }

  getAnnouncementsForMonthly(year: number): Observable<Map<string, Announcement[]>> {
    return this.http.get<Map<string, Announcement[]>>(`${this.baseUrl}/monthly_announcement?year=${year}`);
}


}


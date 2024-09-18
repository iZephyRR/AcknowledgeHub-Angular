import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Announcement } from 'src/app/modules/announcement';
import { Draft } from 'src/app/modules/draft';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private baseUrl = 'http://localhost:8080/api/v1/announcement';

  constructor(private http: HttpClient, private authService: AuthService) {}

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

  getMainPreview(): Observable<{id:number, label:string}[]> {
    return this.http.get<{id:number, label:string}[]>(`${this.baseUrl}/get-main-previews`);
  }

  getSubPreview(): Observable<{id:number, label:string}[]> {
    return this.http.get<{id:number, label:string}[]>(`${this.baseUrl}/get-sub-previews`);
  }

    //fetch all announcements for companyid
    getAllAnnouncementsWithCompanyId(id:string): Observable<Announcement[]> {
      return this.http.get<Announcement[]>(`${this.baseUrl}/getAnnouncementsByCompanyId`);
    }

  //fetch all announcements for individual employee
  getAnnouncementsForEmployee(): Observable<Announcement[]>{
    return this.http.get<Announcement[]>(`${this.baseUrl}/get-By-EmployeeId`);
  }

  getAnnouncementById(id:string):Observable<Announcement>{
    return this.http.get<Announcement>(`${this.baseUrl}/${id}`);
  }

  //fetch all announcements for departmentid
  getAllAnnouncementsWithDepartmentId(id:string): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.baseUrl}/getAnnouncementsByDepartmentId`);
  }

  // Fetch announcements for August to October 2024
  getAnnouncementsForAugToOct2024(): Observable<Map<string, Announcement[]>> {
    return this.http.get<Map<string, Announcement[]>>(`${this.baseUrl}/aug-to-oct-2024`);
  }

  // Custom group data...

  // save draft
  saveDraft(draft : FormData): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.baseUrl}/uploadDraft`,draft);
  }

  getDrafts() : Observable<Draft[]> {
    return this.http.get<Draft[]>(`${this.baseUrl}/get-drafts`);
  }

  getDraftById(draftId : number) : Observable<Draft> {
    return this.http.get<Draft>(`${this.baseUrl}/getDraftById/${draftId}`);
  }

  deleteDraft(draftId : number) : Observable<String> {
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



}


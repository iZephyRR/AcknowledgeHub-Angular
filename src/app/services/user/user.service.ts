import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UniqueFields } from 'src/app/modules/unique-fields';
import { User } from 'src/app/modules/user';
import { Users } from 'src/app/modules/user-excel-upload';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  private baseUrl = 'http://localhost:8080/api/v1';


  constructor(private http: HttpClient) {

  }
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/mr/users`);
  }

  getUsersByCompany(): Observable<User[]> {
    return this.http.get<User[]> (`${this.baseUrl}/getUsersByCompanyId`);
  }

  getUserById(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/user/profile`);
  }


  getUserWhoNotedWithInOneDay(announcementId : string) : Observable<User[]> {
    return this.http.get<User[]> (`${this.baseUrl}/getEmployeesWho1DNoted/${announcementId}`);
  }

  getUserWhoNotedWithInThreeDay(announcementId : string) : Observable<User[]> {
    return this.http.get<User[]> (`${this.baseUrl}/getEmployeesWho3DNoted/${announcementId}`);
  }
  
  getAllByDepartmentID(id: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/hrs/user/by-department/${id}`);
  }

  uploadExcel(users: Users): Observable<User[]> {
    return this.http.post<User[]>(`${this.baseUrl}/hrs/add-users`, users);
  }

  getUniqueFields(): Observable<UniqueFields> {
    return this.http.get<UniqueFields>(`${this.baseUrl}/hrs/get-uniques`);
  }

  updateAll(users:User[]):Observable<User[]>{
    return this.http.put<User[]>(`${this.baseUrl}/hrs/update-users`,users);
  }

}



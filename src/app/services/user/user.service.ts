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
  getRepresentatives() {
    throw new Error('Method not implemented.');
  }
  getAllUsers(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/mr/users`);
  }

  getUserById(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/user/profile`);
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



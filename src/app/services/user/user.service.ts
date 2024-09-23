import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HR } from 'src/app/modules/company';
import { UniqueFields } from 'src/app/modules/unique-fields';
import { User, UserProfile } from 'src/app/modules/user';
import { UpdateUser, Users } from 'src/app/modules/user-excel-upload';
import { SystemService } from '../system/system.service';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  private baseUrl = 'http://localhost:8080/api/v1';
  photoLink:string;
  profileImage:string;

  constructor(private http: HttpClient,private systemService:SystemService) {

  }
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/hrs/users`);
  }

  getUsersByCompany(): Observable<User[]> {
    return this.http.get<User[]> (`${this.baseUrl}/getUsersByCompanyId`);
  }

  getUserById(id:number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/user/${id}`);
  }

  getProfileInfo():Observable<UserProfile>{
    return this.http.get<UserProfile>(`${this.baseUrl}/user/profile`);
  }
  
  getAllByDepartmentID(id: bigint): Observable<UpdateUser[] | User[]> {
    return this.http.get<UpdateUser[]>(`${this.baseUrl}/hrs/user/by-department/${id}`);
  }

  uploadExcel(users: Users): Observable<User[]> {
    return this.http.post<User[]>(`${this.baseUrl}/hrs/add-users`, users);
  }

  uploadEditExcel(users: UpdateUser[]): Observable<User[]> {
    return this.http.put<User[]>(`${this.baseUrl}/hrs/edit-users`, users);
  }

  getUniqueFields(): Observable<UniqueFields> {
    return this.http.get<UniqueFields>(`${this.baseUrl}/hrs/get-uniques`);
  }

  updateAll(users:User[]):Observable<User[]>{
    return this.http.put<User[]>(`${this.baseUrl}/hrs/update-users`,users);
  }

  uploadProfileImage(imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post<any>(`${this.baseUrl}/user/uploadProfileImage`, formData);
  }

  addMainHR(mainHR:HR):Observable<User>{
    return this.http.post<User>(`${this.baseUrl}/ad/main-hr`,mainHR);
  }

  existsMainHR():Observable<boolean>{
    return this.http.get<boolean>(`${this.baseUrl}/ad/exists-main-hr`);
  }

  countEmployee(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/hrs/employee-count`); // Adjust the endpoint as necessary
  }

 
}



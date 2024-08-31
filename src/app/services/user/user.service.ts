import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/modules/user';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  getUsers() {
    throw new Error('Method not implemented.');
  }
  private baseUrl = 'http://localhost:8080/api/v1';

  getRepresentatives() {
    throw new Error('Method not implemented.');
  }

  constructor(private http: HttpClient) {

  }
  getAllUsers(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/mr/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/user/get-user/${id}`);
  }
}



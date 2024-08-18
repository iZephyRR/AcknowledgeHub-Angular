import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/modules/user';

@Injectable({
  providedIn: 'root'
})

export class UserService {
    private baseUrl1 = 'http://localhost:8080/api/v1/get-user';

    getRepresentatives() {
        throw new Error('Method not implemented.');
    }

    constructor(private http: HttpClient) {
        
     }

    getUsersLarge() {
        return this.http.get<any>('assets/demo/data/users-large.json')
            .toPromise()
            .then(res => res.data as User[])
            .then(data => data);
    }

    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.baseUrl1}/${id}`);
      }
}



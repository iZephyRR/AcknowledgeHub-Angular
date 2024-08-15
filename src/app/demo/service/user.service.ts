import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'src/app/service/category/modules/user';

@Injectable()
export class UserService {
    getRepresentatives() {
        throw new Error('Method not implemented.');
    }

    constructor(private http: HttpClient) { }

    getUsersLarge() {
        return this.http.get<any>('assets/demo/data/users-large.json')
            .toPromise()
            .then(res => res.data as User[])
            .then(data => data);
    }
}
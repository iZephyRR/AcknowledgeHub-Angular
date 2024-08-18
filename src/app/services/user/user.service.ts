import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { CheckAuth } from 'src/app/modules/check-auth';

@Injectable({
  providedIn: 'root'
})
class User{

}
export class UserService {

  private baseUrl="http://localhost:8080/api/v1";

  constructor(private http:HttpClient){

  }
}

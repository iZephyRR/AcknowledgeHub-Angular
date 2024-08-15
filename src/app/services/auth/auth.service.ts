import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { MessageService } from '../message/message.service';
import { er } from '@fullcalendar/core/internal-common';
import { CheckAuth } from 'src/app/modules/check-auth';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private baseUrl: string;
  constructor(
    private http: HttpClient,
    private session: LocalStorageService,
    private router: Router,
    // private jwtHelper: JwtHelperService,
    private message: MessageService
  ) {
    this.baseUrl = "http://localhost:8080/api/v1/auth"
  }

  login(credentials: any) {
    return this.http.post<{ jwt_TOKEN: string }>(`${this.baseUrl}/login`, credentials).pipe(
      catchError(error => {
        console.log('error : ' + error)
        this.router.navigate(['/auth/login']);

        return throwError(error);
      })
    )
      .subscribe(response => {
        this.session.add('token', response.jwt_TOKEN);
        this.router.navigate(['/']);
      })
      ;
  }

  invalidateToken(): void {
    this.session.clear();
  }

  check(): Observable<CheckAuth> {
    return this.http.get<CheckAuth>(`${this.baseUrl}/check`);
  }

  logOut(): void {
    if (this.message.comfirmed('Are you sure to log out?')) {
      this.invalidateToken();
      this.session.restartPage();
    }
  }

  // isLogin(): Observable<boolean> {
  //   const id:number=this.getUserId();
  //   return this.http.get<boolean>(`${this.baseUrl}/is-login/${id}`).pipe(
  //     catchError(error => {
  //       return throwError(error);
  //     }
  //     )
  //   );
  // }


  getToken(): string {
    return this.session.get('token');
  }

  getDecodedToken(): JwtPayload | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  getUserId(): string | undefined {
    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken['sub'] : undefined;
  }
}

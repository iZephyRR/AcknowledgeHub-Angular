import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { CheckAuth } from 'src/app/modules/check-auth';
import { SystemService } from '../system/system.service';
import { MessageDemoService } from '../message/message.service';
import { Role } from 'src/app/constants';
import { Router } from '@angular/router';
import { Login } from 'src/app/modules/login';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private _baseUrl: string;
  private _role: Role;

  constructor(
    private http: HttpClient,
    private session: LocalStorageService,
    private router: Router,
    private messageService: MessageDemoService,
    private systemService: SystemService
  ) {
    this.baseUrl = "http://localhost:8080/api/v1/auth";
  }

  private set role(role: Role) {
    this._role = role;
  }

  get role(): Role {
    return this._role;
  }

  get baseUrl(): string {
    return this._baseUrl;
  }

  private set baseUrl(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  get token(): string {
    return this.session.get('token');
  }

  get decodedToken(): JwtPayload | null {
    const token = this.token;
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

  get userId(): string | undefined {
    const decodedToken = this.decodedToken;
    return decodedToken ? decodedToken['sub'] : undefined;
  }
  
  login(credentials: Login) {
    return this.http.post<{ login_RESPONSE: string }>(`${this.baseUrl}/login`, credentials);
  }

  canActivateFor(roles: Role[]) {
    return roles.includes(this.role);
  }

  check(allowedRoles: Role[]): Observable<boolean> | boolean {
    // console.log('this.isLogin : '+this.isLogin());
    // console.log('isLogin : '+((this.getToken() == null) || (this.getToken() == undefined)));
    // console.log('token: '+this.getToken());
    return this.http.get<CheckAuth>(`${this.baseUrl}/check`).pipe(
      map(data => {
        if (this.isLogin()) {
          this.role = data.role;
          console.log('Response data : ' + JSON.stringify(data));
          if (data.status == 'ACTIVATED') {
            if (allowedRoles.length == 0 || allowedRoles.includes(data.role)) {
              this.systemService.hideSpinner();
              console.log('Auth checked..');
              return true;
            } else {
              this.router.navigate(['/']);
              this.systemService.hideSpinner()
              this.messageService.toast('warn', 'Invalid rout', 'You cannot access this rout.')
              console.log('This rout has no permission for ' + JSON.stringify(allowedRoles));
              return false;
            };
          } else {
            console.log('This account has been deactivated!');
            this.messageService.toast('error', 'Account deactivation.', 'This account has been deactivated!');
            this.session.clear();
            this.systemService.hideSpinner();
            this.router.navigate(['/auth/login']);
            return false;
          }
        } else {
          this.systemService.hideSpinner();
          this.router.navigate(['/auth/login']);
          return false;
        }
      }),
      catchError((error) => {
        if (error.status == 403) {
          console.log('Session expired..' + (error.status));
          this.messageService.message('error', 'Session expired.')
          this.systemService.hideSpinner();
          this.session.clear();
          this.router.navigate(['/auth/login']);
        } else {
          console.log('Internal server error..' + (error.status));
          this.systemService.hideSpinner();
          this.router.navigate(['/error']);
        }
        return of(false);
      })
    );
  }

  changePassword(password:string,id:string):Observable<void>{
    return this.http.put<void>(`${this.baseUrl}/change-password`,{password:password,id:id});
  }

  logOut(): void {
    if (this.messageService.comfirmed('Are you sure to log out?')) {
      this.session.clear();
      this.session.restartPage();
    }
  }

  isLogin(): boolean {
    //console.log('isLogin : '+((this.getToken == null) || (this.getToken == undefined)))
    if ((this.token == null) || (this.token == undefined)) {
      return false;
    } else {
      return true;
    }
  }
}
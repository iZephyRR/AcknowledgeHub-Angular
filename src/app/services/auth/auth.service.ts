import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { catchError, firstValueFrom, map, Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { CheckAuth, Role } from 'src/app/modules/check-auth';
import { SystemService } from '../system/system.service';
import { Login } from 'src/app/modules/login';
import { MessageDemoService } from '../message/message.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  baseUrl: string;
  role: Role;
  constructor(
    private http: HttpClient,
    private session: LocalStorageService,
    private router: Router,
    private messageService: MessageDemoService,
    private systemService: SystemService
  ) {
    this.baseUrl = "http://localhost:8080/api/v1"
  }


  login(credentials: Login) {
    return this.http.post<{ jwt_TOKEN: string }>(`${this.baseUrl}/login`, credentials).pipe(
      catchError(error => {
        if(error.status==401){
this.messageService.message('error','Account deactivated.','This account has been deactivated!');
        }else{
//Show invalid email or password in login form.
        }
        console.log('error : ' + error)
        this.router.navigate(['/auth/login']);
        return throwError(error);
      })
    )
      .subscribe(response => {
        this.session.add('token', response.jwt_TOKEN);
        console.log('saved token : ' + this.session.get('token'));
        this.messageService.toast('success','Login success','Successfully logged in!');
        this.router.navigate(['/']);
      })
      ;
  }

  clearCache(): void {
    this.session.clear();
  }
  canActivateFor(roles: Role[]) {
    return roles.includes(this.role);
  }

  check(allowedRoles: Role[]): Observable<boolean> | boolean {
    if (this.isLogin()) {
      return this.http.get<CheckAuth>(`${this.baseUrl}/check`).pipe(
        map(data => {
          this.role = data.role;
          console.log('Response data : '+JSON.stringify(data));
          if(data.status=='ACTIVATED'){
            if (allowedRoles.length == 0 || allowedRoles.includes(data.role)) {
              this.systemService.hideSpinner();
              console.log('Auth checked..');
              return true;
            } else {
              this.router.navigate(['/notfound']);
              this.systemService.hideSpinner()
              console.log('This rout has no permission for ' + JSON.stringify(allowedRoles));
              return false;
            };
          }else{
            console.log('This account has been deactivated!');
            this.messageService.message('error','Account deactivated.','This account has been deactivated!');
            this.clearCache();
            this.systemService.hideSpinner();
            this.router.navigate(['/auth/login']);
            return false;
          }
        }),
        catchError((error) => {
          if(error.status==403){
          console.log('Session expired..' + (error.status)); 
          this.messageService.message('error','Session expired.')
          this.systemService.hideSpinner();
          this.clearCache();
          this.router.navigate(['/auth/login']);
          }else{
            console.log('Internal server error..' + (error.status));
            this.systemService.hideSpinner();
            this.router.navigate(['/error']);
          }
          return of(false);
        })
      );
    } else {
      this.systemService.hideSpinner();
      this.router.navigate(['/auth/login']);
      return false;
    }
  }

  logOut(): void {
    if (this.messageService.comfirmed('Are you sure to log out?')) {
      this.clearCache();
      this.session.restartPage();
    }
  }

  isLogin(): boolean {
    if ((this.getToken == null) || (this.getToken == undefined)) {
      return false;
    } else {
      return true;
    }
  }


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

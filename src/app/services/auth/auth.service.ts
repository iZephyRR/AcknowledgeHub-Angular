import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { catchError, firstValueFrom, map, Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { MessageService } from '../message/message.service';
import { CheckAuth, Role } from 'src/app/modules/check-auth';
import { SystemService } from '../system/system.service';
import { Login } from 'src/app/modules/login';
import { AppComponent } from 'src/app/app.component';

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
    // private jwtHelper: JwtHelperService,
    private messageService: MessageService,
    private systemService: SystemService
  ) {
    this.baseUrl = "http://localhost:8080/api/v1/auth"
    //console.log('role : '+appComponent.role);
  }


  login(credentials: Login) {
    return this.http.post<{ jwt_TOKEN: string }>(`${this.baseUrl}/login`, credentials).pipe(
      catchError(error => {
        console.log('error : ' + error)
        this.router.navigate(['/auth/login']);
        return throwError(error);
      })
    )
      .subscribe(response => {
        this.session.add('token', response.jwt_TOKEN);
        console.log('saved token : ' + this.session.get('token'));
        this.router.navigate(['/']);
      })
      ;
  }

  clearCache(): void {
    this.session.clear();
  }

  // async getRole():Promise<Role>{
  //   try{
  //     const data = await firstValueFrom(this.http.get<Role>(`${this.baseUrl}/get-role`));
  //     console.log('Get role : ' + data);
  //     return data;
  //   }catch(error){
  //     console.log('Error getting roles', error);
  //     return null;
  //   }

  // }

  //   async canShow(allowedRoles: Role[]): Promise<boolean> {
  //     try {
  //         const data = await firstValueFrom(this.check(allowedRoles));
  //         console.log('Can show : ' + data);
  //         return data;
  //     } catch (error) {
  //         console.error('Error checking roles', error);
  //         return false;
  //     }
  // }
  canActivateFor(roles: Role[]) {
    return roles.includes(this.role);
  }

  check(allowedRoles: Role[]): Observable<boolean> | boolean {
    if (this.isLogin()) {
      return this.http.get<CheckAuth>(`${this.baseUrl}/check`).pipe(
        map(data => {
          this.role = data.role;
          console.log('Auth data : ' + JSON.stringify(data));
          console.log('local role : '+this.role);
          //console.log('Allowed Roles for page : ' + JSON.stringify(allowedRoles));
          switch (data.status) {
            case 'ACTIVATED':
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
            case 'DEACTIVATED':
            case 'DEPARTED':
              console.log('This account has been deactivated!'); // default message for both case.
              this.clearCache();
              this.systemService.hideSpinner();
              this.router.navigate(['/auth/login']);
              return false;
            default:
              console.log('Session expired.')//show message
              this.clearCache();
              this.systemService.hideSpinner();
              this.router.navigate(['/auth/login']);
              return false;
          }
        }),
        catchError((error) => {
          if(error.status==403){
          console.log('Session expired..' + (error.status)); //Show message that session expired..
          this.systemService.hideSpinner();
          this.clearCache();
          this.router.navigate(['/auth/login']);
          }else{
            console.log('Internal server error..' + (error.status)); //Need a page to show 500 error..
            this.systemService.hideSpinner();
            this.router.navigate(['/notfound']);
          }
          return of(false);
        })
      );
    } else {
      console.log('Session expired.')//show message
      this.clearCache();
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

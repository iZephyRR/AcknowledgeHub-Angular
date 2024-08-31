import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable, OnInit, signal, Signal } from '@angular/core';
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
  private _companyId: number;
  public error=signal('');
  private static readonly ALLOWED_DOMAINS: Set<string> = new Set<string>([
    "@gmail.com",
    "@yahoo.com",
    "@outlook.com",
    "@hotmail.com",
    "@aol.com",
    "@icloud.com",
    "@protonmail.com",
    "@yandex.com",
    "@mail.com",
    "@zoho.com",
    "@aceinspiration.com"
  ]);

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

  get companyId(): number {
    return this._companyId;
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
    return this.http.post<{ string_RESPONSE: string }>(`${this.baseUrl}/login`, credentials);
  }
  
  canActivateFor(roles: Role[]) {
    return roles.includes(this.role);
  }

  severConnectionTest():void{
    this.systemService.showLoading('',true);
     this.http.get<void>(this.baseUrl+'/sever-connection-test').subscribe({
      error:(err)=>{
        console.error(err);
          this.systemService.hideLoading();
          this.router.navigate(['/error']);
      },
      complete:()=>{
          this.systemService.hideLoading();
          this.systemService.restartPage();
      }
  });
  }

  check(allowedRoles: Role[]): Observable<boolean> | boolean {
    return this.http.get<CheckAuth>(`${this.baseUrl}/check`).pipe(
      map(data => {
        if (this.isLogin()) {
          this.role = data.role;
          this._companyId = data.companyId;
          console.log('Response data : ' + JSON.stringify(data));
          if (data.status == 'ACTIVATED') {
            if (allowedRoles.length == 0 || allowedRoles.includes(data.role)) {
              this.systemService.hideLoading();
              return true;
            } else {
              this.router.navigate(['/']);
              this.systemService.hideLoading();
              this.messageService.toast('warn', 'You cannot access this rout.')
              console.log('This rout has no permission for ' + JSON.stringify(allowedRoles));
              return false;
            };
          } else {
            console.log('This account has been deactivated!');
            this.messageService.toast('error', 'This account has been deactivated!');
            this.session.clear();
            this.systemService.hideLoading();
            this.router.navigate(['/auth/login']);
            return false;
          }
        } else {
          this.systemService.hideLoading();
          this.router.navigate(['/auth/login']);
          return false;
        }
      }),
      catchError((error) => {
        this.error.set('Error : '+error);
        if (error.status == 403) {
          console.log('Session expired..' + (error.status));
          this.messageService.message('error', 'Session expired.')
          this.systemService.hideLoading();
          this.session.clear();
          this.router.navigate(['/auth/login']);
        } else {
          console.log('Internal server error..' + (error.status));
          this.systemService.hideLoading();
          this.router.navigate(['/error']);
        }
        return of(false);
      })
    );
  }

  changePassword(password: string, email: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/change-password`, { password: password, email: email });
  }

  isExistEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/check-email`);
  }
  findNameByEmail(email: string) {
    return this.http.post<{ string_RESPONSE: string }>(`${this.baseUrl}/find-name-by-email`, email);
  }
  isPasswordDefault(email: string) {
    return this.http.post<{ boolean_RESPONSE: boolean }>(`${this.baseUrl}/is-password-default`, email);
  }

  async logOut(): Promise<void> {
    if ((await this.messageService.confirmed('Logout Confimation', 'Are you sure to log out?', 'Yes', 'No', 'WHITE', 'BLACK')).confirmed) {
      this.messageService.toast('info', 'Logged out.');
      this.session.clear();
      this.router.navigate(['/auth/login']);
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

  uploadFile():Observable<void>  {
   return this.http.get<void>(`${this.baseUrl}/test`);
  }
  static isDomainAvailable(domain: string): boolean {
    return Array.from(this.ALLOWED_DOMAINS).some(allowedDomain => domain.endsWith(allowedDomain));
  }
}

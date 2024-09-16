import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable, OnInit, signal, Signal } from '@angular/core';
import { catchError, filter, map, Observable, of, Subscription, throwError } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { CheckAuth } from 'src/app/modules/check-auth';
import { SystemService } from '../system/system.service';
import { MessageDemoService } from '../message/message.service';
import { Role } from 'src/app/constants';
import { NavigationEnd, Router } from '@angular/router';
import { Login } from 'src/app/modules/login';
import { User } from 'src/app/modules/user';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private _baseUrl: string;
  private _role: Role;
  private _companyId: number;
  showNotFound: boolean;
  xShowNotFound: boolean;
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
    return this.http.post<{ STRING_RESPONSE: string }>(`${this.baseUrl}/login`, credentials);
  }

  canActivateFor(roles: Role[]) {
    return roles.includes(this.role);
  }

  severConnectionTest(): void {
    this.systemService.showLoading('', true);
    this.http.get<void>(this.baseUrl + '/sever-connection-test').subscribe({
      error: (err) => {
        console.error(err);
        this.systemService.hideLoading();
        this.router.navigate(['/error']);
      },
      complete: () => {
        this.systemService.hideLoading();
        this.systemService.restartPage();
      }
    });
  }

  check(allowedRoles: Role[]): Observable<boolean> | boolean {
    this.showNotFound = false;
    this.xShowNotFound = false;
    if (this.isLogin()) {
      return this.http.get<CheckAuth>(`${this.baseUrl}/check`).pipe(
        map(data => {
          this.systemService.hideLoading();
          this.role = data.role;
          this._companyId = data.companyId;
          console.log('Response data : ' + JSON.stringify(data));
          if (data.status == 'ACTIVATED') {
            if (!(allowedRoles.length == 0 || allowedRoles.includes(data.role))) {
              this.showNotFound = true;
              this.xShowNotFound = true;
            }
            return true;
          } else {
            this.messageService.toast('error', 'This account has been deactivated!');
            this.session.clear();
            this.router.navigate(['/login']);
            return false;
          }

        }),
        catchError((error) => {
          if (error.status == 403) {
            this.messageService.alert('Session Expired','Session was expired and you will need to login again.','OUTSET','WHITE','RED');
            this.session.clear();
            this.router.navigate(['/login']);
          } else {
            console.log('Internal server error..' + (error.status));
            this.router.navigate(['/error']);
          }
            this.systemService.hideLoading();
          return of(false);
        })
      );
    } else {
      if(this.systemService.currentRout()!='/login'){
          this.messageService.toast('warn', 'Login first!');
      }
      this.systemService.hideLoading();
       this.router.navigate(['/login']);
      return false;
    }
  }

  changePassword(password: string, email: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/change-password`, { password: password, email: email });
  }

  changePassword2(password: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/change-password`, { password: password, email:null });
  }

  
  validateCurrentPassword(password: string): Observable<{BOOLEAN_RESPONSE:boolean}> {
    return this.http.post<{BOOLEAN_RESPONSE:boolean}>(`http://localhost:8080/api/v1/user/check-password`,  password ).pipe(
        catchError(error => {
            console.error('Password validation error:', error);
            return throwError(error);
        })
    );
}

  isExistEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/check-email`);
  }

  findNameByEmail(email: string) {
    return this.http.post<{ STRING_RESPONSE: string }>(`${this.baseUrl}/find-name-by-email`, email);
  }

  isPasswordDefault(email: string) {
    return this.http.post<{ STRING_RESPONSE: boolean }>(`${this.baseUrl}/is-password-default`, email);
  }

  getDefaultPassword(): Observable<{ STRING_RESPONSE: string }> {
    return this.http.get<{ STRING_RESPONSE: string }>(`http://localhost:8080/api/v1/ad/default-password`);
  }

  changeDefaultPassword(password: string): Observable<{ STRING_RESPONSE: string }> {
    return this.http.put<{ STRING_RESPONSE: string }>(`http://localhost:8080/api/v1/ad/default-password`, password);
  }

  makePasswordAsDefault(id: number): Observable<string> {
    return this.http.put<string>(`http://localhost:8080/api/v1/ad/make-password-as-default`, id);
  }

  async logOut(): Promise<void> {
    if ((await this.messageService.confirmed('Logout Confimation', 'Are you sure to log out?', 'Yes', 'No', 'WHITE', 'BLACK')).confirmed) {
      this.messageService.toast('info', 'Logged out.');
      this.session.clear();
      this.router.navigate(['/login']);
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

  uploadFile(): Observable<void> {
    return this.http.get<void>(`${this.baseUrl}/test`);
  }

  static isDomainAvailable(domain: string): boolean {
    return Array.from(this.ALLOWED_DOMAINS).some(allowedDomain => domain.endsWith(allowedDomain));
  }

  isServerInResting():Observable<boolean>{
    return this.http.get<boolean>(`http://localhost:8080/api/v1/ad/rest-system`);
  }

  restServer():Observable<void>{
    return this.http.post<void>(`http://localhost:8080/api/v1/ad/rest-system`,{});
  }
}

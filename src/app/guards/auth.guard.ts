import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean>{
    return this.authService.check(route.data['roles'] || []);
  }
}

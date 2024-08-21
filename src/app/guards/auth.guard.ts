import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { catchError, empty, map, Observable, of } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { SystemService } from '../services/system/system.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
    private messageService: SystemService
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean{
    console.log('Auth guard passed.'+this.authService.role);
    return this.authService.check(route.data['roles'] || []);
  }
}

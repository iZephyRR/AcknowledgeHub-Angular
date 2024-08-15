import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { CheckAuth } from '../modules/check-auth';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    console.log('Token :b ' + this.authService.getToken());
    return this.authService.check().pipe(
      map(data => {
        const allowedRoles: string[] = route.data['roles'] || [];
        if (data.status === 'ACTIVATED') {
          if (allowedRoles.includes(data.role)) {
            return true;
          } else {
            this.router.navigate(['/notfound']);
            return false;
          }
        } else {
          this.authService.invalidateToken();
          this.router.navigate(['/notfound']);
          return false;
        }
      }),
      catchError((error) => {
        this.router.navigate(['/notfound']);
        return of(false);
      })
    );
  }
}

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
    console.log('Token :b '+this.authService.getToken());
    return this.authService.check().pipe(
      map(data => {
        if (data.status === 'ACTIVATED' && data.role === route.data['role']) {
          console.log(1);
          return true;
        } else {
          this.router.navigate(['/notfound']); // Redirect to unauthorized or another page if not allowed
          console.log(2);
          return false;
        }
      }),
      catchError((error) => {
        console.log(3);
        this.router.navigate(['/notfound']); // Redirect to login on error
        return of(false);
      })
    );
  }
}

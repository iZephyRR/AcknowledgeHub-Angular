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

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.check().pipe(
      map(data => {
        const allowedRoles: string[] = route.data['roles'] || [];
        if (data.status === 'ACTIVATED') {
          if (allowedRoles.length == 0 || allowedRoles.includes(data.role)) {
            this.messageService.hideSpinner();
            return true;
          } else {
            this.router.navigate(['/notfound']);
            this.messageService.hideSpinner()
            return false;
          };
        } else {
          this.authService.invalidateToken();
          this.messageService.hideSpinner();
          this.router.navigate(['/notfound']);
          return false;
        }
      }),
      catchError((error) => {
        this.authService.invalidateToken();
        this.messageService.hideSpinner();
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}

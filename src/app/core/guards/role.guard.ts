import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class roleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {

    const expectedRoles: string[] = route.data['roles'];

    const userRole = this.authService.getUserRole(); // à créer dans auth.service.ts

    if (!userRole || !expectedRoles.includes(userRole)) {
      // Redirection vers /home si le rôle ne correspond pas
      this.router.navigate(['/home']);
      return false;
    }

    return true;
  }
}


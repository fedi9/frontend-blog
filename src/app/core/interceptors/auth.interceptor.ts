import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.log('🔐 Session expirée, redirection vers la page de login...');
            // Nettoyer les données de session
            this.authService.logout();
            // Rediriger vers la page de login avec un message
            this.router.navigate(['/login'], { 
              queryParams: { 
                message: 'Votre session a expiré. Veuillez vous reconnecter.' 
              } 
            });
          }
          return throwError(() => error);
        })
      );
    }

    return next.handle(req);
  }
}

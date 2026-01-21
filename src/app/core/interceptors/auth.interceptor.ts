import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Clone request and add authorization header if token exists
  let authReq = req;
  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  } else if (!req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    // Even without token, ensure we're requesting JSON
    authReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        // Try to refresh token
        const refreshToken = authService.getRefreshToken();

        if (refreshToken && !req.url.includes('/auth/refresh')) {
          // Attempt to refresh the token
          return authService.refreshToken().pipe(
            switchMap((response) => {
              // Retry the original request with new token
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.accessToken}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              });
              return next(retryReq);
            }),
            catchError((refreshError) => {
              // Refresh failed, logout user
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        } else {
          // No refresh token or refresh endpoint called, logout
          authService.logout();
        }
      }

      // Handle 403 Forbidden errors
      if (error.status === 403) {
        console.error('Access forbidden - insufficient permissions');
        router.navigate(['/dashboard']);
      }

      return throwError(() => error);
    })
  );
};

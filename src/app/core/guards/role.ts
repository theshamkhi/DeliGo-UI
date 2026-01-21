import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    const hasRole = authService.hasAnyRole(allowedRoles);
    if (hasRole) {
      return true;
    }

    // User doesn't have required role, redirect to dashboard
    console.warn('Access denied. Required roles:', allowedRoles);
    router.navigate(['/dashboard']);
    return false;
  };
};

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Route guard that prevents unauthenticated users from accessing protected routes.
 * Redirects to /login if no valid in-memory access token exists.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login, preserving the original URL is handled at the router level
  router.navigate(['/login']);
  return false;
};

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Functional HTTP interceptor that:
 * 1. Attaches the JWT Bearer access token to every outgoing request (if authenticated).
 * 2. Intercepts 401 Unauthorized responses and attempts a silent token refresh once.
 * 3. Redirects to /login if the refresh also returns 401 (refresh token expired/revoked).
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  /**
   * Clones the request and attaches the Authorization Bearer header.
   * Cloning is required because HttpRequest objects are immutable.
   */
  const attachToken = (request: HttpRequest<unknown>, token: string): HttpRequest<unknown> =>
    request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

  const accessToken = authService.getAccessToken();

  // Attach Bearer token if the user is authenticated
  const authenticatedReq = accessToken ? attachToken(req, accessToken) : req;

  return next(authenticatedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only intercept 401 responses — other errors propagate normally
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Attempt a silent token refresh using the stored refresh token
      return authService.refreshToken().pipe(
        switchMap(refreshResponse => {
          // Retry the original failed request with the newly obtained access token
          const retryReq = attachToken(req, refreshResponse.accessToken);
          return next(retryReq);
        }),
        catchError(refreshError => {
          // Refresh failed (expired/revoked) — let the AuthService handle redirect to /login
          return throwError(() => refreshError);
        })
      );
    })
  );
};

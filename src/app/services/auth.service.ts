import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, RefreshTokenResponse, UserSession } from '../models/auth.model';

/**
 * Service responsible for JWT-based authentication against the CaliBro API.
 * Manages in-memory access token, localStorage refresh token, and user session signal.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  /** Base URL of the CaliBro API with versioning tag. */
  private readonly baseUrl = 'https://localhost:7124/api/v1.0';

  /**
   * In-memory access token — never stored in localStorage/sessionStorage to mitigate XSS risks.
   * Will be lost on page refresh; token refresh flow handles re-authentication.
   */
  private _accessToken: string | null = null;

  /** Reactive signal exposing the current user session to components. */
  public currentUser = signal<UserSession | null>(null);

  constructor() {
    // Attempt silent token refresh on app init if a refresh token exists in localStorage.
    // This allows the user to stay logged in across page refreshes.
    const storedRefreshToken = this.getStoredRefreshToken();
    if (storedRefreshToken) {
      this.silentRefresh(storedRefreshToken).subscribe({
        error: () => this.clearSession() // refresh token expired — force re-login
      });
    }
  }

  /**
   * Authenticates the user against the CaliBro API using username/password credentials.
   * On success, stores the access token in memory and refresh token in localStorage.
   * @param credentials - The username and password payload.
   * @returns Observable resolving with the full login response DTO.
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(err => {
        // Surface the API error message if available, otherwise use a generic message
        const message = err.error?.message ?? 'Login failed. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  /**
   * Exchanges the current refresh token for a new access + refresh token pair.
   * Called automatically by the auth interceptor on 401 responses.
   * @returns Observable resolving with the new token pair.
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available.'));
    }
    return this.http.post<RefreshTokenResponse>(`${this.baseUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        // Store new access token in memory and rotate the refresh token in localStorage
        this._accessToken = response.accessToken;
        this.storeRefreshToken(response.refreshToken);
        // Update session expiry based on the new access token TTL
        const session = this.currentUser();
        if (session) {
          this.currentUser.set({
            ...session,
            accessTokenExpiry: this.computeExpiry(response.expiresIn)
          });
        }
      }),
      catchError(err => {
        // Refresh token has expired or been revoked — user must re-authenticate
        this.clearSession();
        this.router.navigate(['/login']);
        return throwError(() => err);
      })
    );
  }

  /**
   * Logs the user out by revoking the refresh token on the server and clearing local session.
   */
  logout(): void {
    const refreshToken = this.getStoredRefreshToken();
    if (refreshToken && this._accessToken) {
      // Fire-and-forget revocation — proceed with local cleanup regardless of server response
      this.http.post(`${this.baseUrl}/auth/logout`, { refreshToken }, {
        headers: { Authorization: `Bearer ${this._accessToken}` }
      }).subscribe({ error: () => {} });
    }
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /**
   * Returns the current in-memory access token for use in HTTP request headers.
   * @returns The raw JWT access token string, or null if not authenticated.
   */
  getAccessToken(): string | null {
    return this._accessToken;
  }

  /**
   * Checks if the user is currently authenticated (access token present in memory).
   * @returns True when a valid session exists.
   */
  isAuthenticated(): boolean {
    return this._accessToken !== null && this.currentUser() !== null;
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  /**
   * Processes a successful auth response: stores tokens and updates the user session signal.
   * @param response - The login or refresh response DTO from the API.
   */
  private handleAuthResponse(response: LoginResponse): void {
    this._accessToken = response.accessToken;
    this.storeRefreshToken(response.refreshToken);
    this.currentUser.set({
      username: response.username,
      fullName: response.fullName,
      email: response.email,
      roles: response.roles,
      role: response.roles?.[0] ?? 'User',
      accessTokenExpiry: this.computeExpiry(response.expiresIn)
    });
  }

  /**
   * Initiates a silent token refresh on app startup using a stored refresh token.
   * @param refreshToken - The raw refresh token from localStorage.
   */
  private silentRefresh(refreshToken: string): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(`${this.baseUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        this._accessToken = response.accessToken;
        this.storeRefreshToken(response.refreshToken);
        // Reconstruct minimal session from the new access token — full profile available from future API calls
        const existing = localStorage.getItem('calibro-user-meta');
        if (existing) {
          try {
            const meta = JSON.parse(existing) as UserSession;
            this.currentUser.set({ ...meta, accessTokenExpiry: this.computeExpiry(response.expiresIn) });
          } catch { /* ignore parse errors */ }
        }
      }),
      catchError(err => {
        this.clearSession();
        return throwError(() => err);
      })
    );
  }

  /** Stores the raw refresh token in localStorage (used for silent refresh across page reloads). */
  private storeRefreshToken(token: string): void {
    localStorage.setItem('calibro-refresh-token', token);
  }

  /** Retrieves the refresh token from localStorage. */
  private getStoredRefreshToken(): string | null {
    return localStorage.getItem('calibro-refresh-token');
  }

  /** Clears all tokens and the user session signal. */
  private clearSession(): void {
    this._accessToken = null;
    this.currentUser.set(null);
    localStorage.removeItem('calibro-refresh-token');
    localStorage.removeItem('calibro-user-meta');
  }

  /** Computes an ISO-8601 expiry timestamp from a TTL in seconds. */
  private computeExpiry(expiresInSeconds: number): string {
    return new Date(Date.now() + expiresInSeconds * 1000).toISOString();
  }
}

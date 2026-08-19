/**
 * Auth request and response models matching the CaliBro API DTOs.
 */

/** Payload sent to POST /api/auth/login */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Response from POST /api/auth/login and POST /api/auth/refresh */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
}

/** Response from POST /api/auth/refresh */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** In-memory user session derived from JWT claims / login response */
export interface UserSession {
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  role?: string;
  /** ISO-8601 string marking when the access token expires */
  accessTokenExpiry: string;
}


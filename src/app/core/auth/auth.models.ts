import { Observable } from 'rxjs';

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  username: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

/** Shape returned by the HTTP API; every field is optional defensively. */
export interface AuthApiResponse {
  access_token?: string;
  accessToken?: string;
  username?: string;
  user?: { username?: string };
}

/**
 * The one seam between "auth against a real API" and "auth against
 * localStorage". Both implementations resolve to an AuthSession or fail with
 * an Error whose `message` is safe to show to the user.
 */
export interface AuthBackend {
  register(credentials: AuthCredentials): Observable<AuthSession>;
  login(credentials: AuthCredentials): Observable<AuthSession>;
}

export const GENERIC_AUTH_ERROR = 'Something went wrong. Please try again.';

import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../api/api.service';
import {
  AuthApiResponse,
  AuthBackend,
  AuthCredentials,
  AuthSession,
  GENERIC_AUTH_ERROR
} from './auth.models';

/**
 * Auth against the HTTP API described by `environment.apiUrl`. Selected by
 * setting `environment.useRemoteAuth` to true; see auth-backend.token.ts.
 */
@Injectable({ providedIn: 'root' })
export class RemoteAuthBackend implements AuthBackend {
  private api = inject(ApiService);

  register(credentials: AuthCredentials): Observable<AuthSession> {
    return this.api.registerUser(credentials).pipe(
      map(res => this.toSession(res, credentials)),
      catchError(err => this.toAuthError(err))
    );
  }

  login(credentials: AuthCredentials): Observable<AuthSession> {
    return this.api.loginUser(credentials).pipe(
      map(res => this.toSession(res, credentials)),
      catchError(err => this.toAuthError(err))
    );
  }

  private toSession(res: AuthApiResponse, credentials: AuthCredentials): AuthSession {
    return {
      accessToken: res?.access_token ?? res?.accessToken ?? '',
      user: { username: res?.user?.username ?? res?.username ?? credentials.username.trim() }
    };
  }

  /**
   * A status-0 failure carries a ProgressEvent in `error`, which has no
   * `message` — reading it blindly is how the form used to fail silently.
   */
  private toAuthError(err: HttpErrorResponse): Observable<never> {
    const fromServer = typeof err?.error?.message === 'string' ? err.error.message : null;
    const message =
      fromServer ??
      (err?.status === 0 ? 'Cannot reach the server. Please try again later.' : GENERIC_AUTH_ERROR);

    return throwError(() => new Error(message));
  }
}

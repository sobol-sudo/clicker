import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { AUTH_BACKEND } from './auth-backend.token';
import { AuthSessionStore } from './auth-session.store';
import { AuthCredentials, AuthSession, AuthUser } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private backend = inject(AUTH_BACKEND);
  private store = inject(AuthSessionStore);

  private _session = new BehaviorSubject<AuthSession | null>(this.store.read());

  readonly session$ = this._session.asObservable();
  readonly user$: Observable<AuthUser | null> = this.session$.pipe(map(s => s?.user ?? null));
  readonly isAuthenticated$: Observable<boolean> = this.session$.pipe(map(s => s !== null));

  get user(): AuthUser | null {
    return this._session.value?.user ?? null;
  }

  register(credentials: AuthCredentials): Observable<AuthSession> {
    return this.backend.register(credentials).pipe(tap(session => this.startSession(session)));
  }

  login(credentials: AuthCredentials): Observable<AuthSession> {
    return this.backend.login(credentials).pipe(tap(session => this.startSession(session)));
  }

  logout(): void {
    this.store.clear();
    this._session.next(null);
  }

  private startSession(session: AuthSession): void {
    this.store.write(session);
    this._session.next(session);
  }
}

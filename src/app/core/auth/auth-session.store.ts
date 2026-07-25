import { Injectable } from '@angular/core';
import { AuthSession } from './auth.models';

const SESSION_KEY = 'clicker.auth.session';

/**
 * Persists the current session so a reload keeps the user signed in, and gives
 * AuthInterceptor a dependency-free way to read the token (injecting
 * AuthService there would create a cycle through HttpClient).
 */
@Injectable({ providedIn: 'root' })
export class AuthSessionStore {
  read(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Partial<AuthSession>;
      if (!parsed?.accessToken || !parsed?.user?.username) return null;

      return { accessToken: parsed.accessToken, user: { username: parsed.user.username } };
    } catch {
      return null;
    }
  }

  write(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  clear(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  get token(): string | null {
    return this.read()?.accessToken ?? null;
  }
}

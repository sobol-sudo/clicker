import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AuthBackend, AuthCredentials, AuthSession } from './auth.models';

const USERS_KEY = 'clicker.auth.users';

/**
 * DEMO ONLY. Passwords are stored verbatim in localStorage: there is no
 * hashing, no salt and no server, because there is no secret worth protecting
 * in a browser-only clicker game. This backend exists so the sign-up /
 * sign-in flow is exercisable on a static deployment — it is not a security
 * boundary and none of it should be reused in a product.
 */
interface StoredUser {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class LocalAuthBackend implements AuthBackend {
  register({ username, password }: AuthCredentials): Observable<AuthSession> {
    const name = username.trim();
    const users = this.readUsers();

    if (users[name.toLowerCase()]) {
      return throwError(() => new Error('That username is already taken.'));
    }

    users[name.toLowerCase()] = { username: name, password };
    this.writeUsers(users);

    return of(this.createSession(name));
  }

  login({ username, password }: AuthCredentials): Observable<AuthSession> {
    const stored = this.readUsers()[username.trim().toLowerCase()];

    if (!stored || stored.password !== password) {
      return throwError(() => new Error('Incorrect username or password.'));
    }

    return of(this.createSession(stored.username));
  }

  /** An opaque, unsigned placeholder that stands in for a real access token. */
  private createSession(username: string): AuthSession {
    const accessToken = `demo.${btoa(encodeURIComponent(username))}.${Date.now()}`;
    return { accessToken, user: { username } };
  }

  private readUsers(): Record<string, StoredUser> {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? (JSON.parse(raw) as Record<string, StoredUser>) : {};
    } catch {
      return {};
    }
  }

  private writeUsers(users: Record<string, StoredUser>): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

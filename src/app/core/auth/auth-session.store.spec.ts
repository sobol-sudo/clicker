import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { AuthSessionStore } from './auth-session.store';
import { AuthService } from './auth.service';
import { installFakeStorage } from 'src/app/testing/test-utils';

const SESSION_KEY = 'clicker.auth.session';

/**
 * Whatever is under this key is the app's answer to "who is signed in", and it
 * is a string a browser hands back that nothing in the app wrote this run — a
 * half-finished write, an older build's shape, a hand-edited value. The store
 * guards against all of that and no spec exercised the guard, so the guard
 * could be dropped as dead defensive code without a single test noticing.
 */
describe('AuthSessionStore', () => {
  let store: AuthSessionStore;

  const unusable: [string, string][] = [
    ['not JSON at all', 'not json at all'],
    ['a token with no user attached', '{"accessToken":"token-123"}'],
    ['a user with no token', '{"user":{"username":"ada"}}'],
    ['a user with a blank name', '{"accessToken":"token-123","user":{"username":""}}'],
    ['JSON that is not an object', '"token-123"']
  ];

  beforeEach(() => {
    installFakeStorage();
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    store = TestBed.inject(AuthSessionStore);
  });

  it('reads a session it wrote itself', () => {
    store.write({ accessToken: 'token-123', user: { username: 'ada' } });

    expect(store.read()).toEqual({ accessToken: 'token-123', user: { username: 'ada' } });
    expect(store.token).toBe('token-123');
  });

  it('reports no session at all for anything it cannot use', () => {
    for (const [description, raw] of unusable) {
      localStorage.setItem(SESSION_KEY, raw);

      // Returning the half-shape instead would sign the app in as `undefined`
      // and hand the interceptor a token that is not there.
      expect(store.read()).withContext(description).toBeNull();
      expect(store.token).withContext(description).toBeNull();
    }
  });

  it('starts the app signed out when the stored session is unusable', async () => {
    localStorage.setItem(SESSION_KEY, '{"accessToken":"token-123"}');

    // The consequence the player sees: a broken save must produce the signed-out
    // screen, not an account chip with no name on it.
    const service = TestBed.inject(AuthService);

    expect(service.user).toBeNull();
    expect(await firstValueFrom(service.isAuthenticated$)).toBe(false);
  });
});

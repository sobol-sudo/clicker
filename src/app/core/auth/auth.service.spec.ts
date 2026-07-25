import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';
import { AuthSessionStore } from './auth-session.store';

/**
 * These run against the default (local) backend, which is what the deployed
 * demo uses.
 */
describe('AuthService', () => {
  let service: AuthService;

  const credentials = { username: 'ada', password: 'lovelace1' };

  beforeEach(() => {
    localStorage.removeItem('clicker.auth.users');
    localStorage.removeItem('clicker.auth.session');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.removeItem('clicker.auth.users');
    localStorage.removeItem('clicker.auth.session');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts signed out', async () => {
    expect(await firstValueFrom(service.isAuthenticated$)).toBe(false);
    expect(service.user).toBeNull();
  });

  it('register signs the new user in and persists the session', async () => {
    const session = await firstValueFrom(service.register(credentials));

    expect(session.accessToken).toBeTruthy();
    expect(session.user.username).toBe('ada');
    expect(service.user?.username).toBe('ada');
    expect(await firstValueFrom(service.isAuthenticated$)).toBe(true);
    expect(TestBed.inject(AuthSessionStore).read()?.user.username).toBe('ada');
  });

  it('register rejects a username that is already taken', async () => {
    await firstValueFrom(service.register(credentials));

    await expectAsync(firstValueFrom(service.register(credentials)))
      .toBeRejectedWithError('That username is already taken.');
  });

  it('login accepts the registered credentials', async () => {
    await firstValueFrom(service.register(credentials));
    service.logout();

    const session = await firstValueFrom(service.login(credentials));

    expect(session.user.username).toBe('ada');
    expect(service.user?.username).toBe('ada');
  });

  it('login rejects a wrong password', async () => {
    await firstValueFrom(service.register(credentials));
    service.logout();

    await expectAsync(firstValueFrom(service.login({ username: 'ada', password: 'wrongpass' })))
      .toBeRejectedWithError('Incorrect username or password.');
    expect(service.user).toBeNull();
  });

  it('login rejects an unknown user', async () => {
    await expectAsync(firstValueFrom(service.login({ username: 'nobody', password: 'secret123' })))
      .toBeRejectedWithError('Incorrect username or password.');
  });

  it('logout clears the session from memory and storage', async () => {
    await firstValueFrom(service.register(credentials));

    service.logout();

    expect(service.user).toBeNull();
    expect(await firstValueFrom(service.isAuthenticated$)).toBe(false);
    expect(TestBed.inject(AuthSessionStore).read()).toBeNull();
  });

  it('restores a persisted session on construction', async () => {
    await firstValueFrom(service.register(credentials));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });

    expect(TestBed.inject(AuthService).user?.username).toBe('ada');
  });
});

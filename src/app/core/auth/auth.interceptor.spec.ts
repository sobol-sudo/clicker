import { TestBed } from '@angular/core/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';

import { AuthInterceptor } from './auth.interceptor';
import { AuthSessionStore } from './auth-session.store';
import { installFakeStorage } from 'src/app/testing/test-utils';

/**
 * The interceptor is the only thing standing between the signed-in user's
 * access token and every URL the app will ever request. It gets no test from
 * the flows above it: sign-in works whether or not the token is ever attached,
 * and it works just as well when the token is attached to somebody else.
 */
describe('AuthInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  const THIRD_PARTY = 'https://analytics.example.com/collect';

  function setUp(): void {
    installFakeStorage();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }]
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  }

  function signIn(token: string): void {
    TestBed.inject(AuthSessionStore).write({ accessToken: token, user: { username: 'ada' } });
  }

  it('sends the token to the API and to nowhere else', () => {
    setUp();
    signIn('token-123');

    http.get(`${environment.apiUrl}/auth/me`).subscribe();
    http.get(THIRD_PARTY).subscribe();

    expect(controller.expectOne(`${environment.apiUrl}/auth/me`).request.headers.get('Authorization'))
      .toBe('Bearer token-123');

    // Widening the URL check — or dropping it — hands the user's credential to
    // every host the app talks to, and nothing else in the app would notice.
    expect(controller.expectOne(THIRD_PARTY).request.headers.has('Authorization'))
      .withContext('third-party request must not carry the session token')
      .toBe(false);

    controller.verify();
  });

  it('leaves the request alone when nobody is signed in', () => {
    setUp();

    http.get(`${environment.apiUrl}/auth/me`).subscribe();

    // No session means no header at all. Sending an empty or "Bearer null"
    // header instead turns a plain anonymous call into a rejected one.
    expect(controller.expectOne(`${environment.apiUrl}/auth/me`).request.headers.has('Authorization'))
      .toBe(false);

    controller.verify();
  });

  it('stops sending the token as soon as the user signs out', () => {
    setUp();
    signIn('token-123');
    TestBed.inject(AuthSessionStore).clear();

    http.get(`${environment.apiUrl}/auth/me`).subscribe();

    // The interceptor reads the store per request rather than caching it, so a
    // sign-out has to take effect on the very next call.
    expect(controller.expectOne(`${environment.apiUrl}/auth/me`).request.headers.has('Authorization'))
      .toBe(false);

    controller.verify();
  });
});

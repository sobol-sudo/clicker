import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

import { RemoteAuthBackend } from './remote-auth.backend';

describe('RemoteAuthBackend', () => {
  let backend: RemoteAuthBackend;
  let http: HttpTestingController;

  const credentials = { username: 'ada', password: 'lovelace1' };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    backend = TestBed.inject(RemoteAuthBackend);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('maps a successful response to a session', async () => {
    const pending = firstValueFrom(backend.login(credentials));

    http.expectOne(`${environment.apiUrl}/auth/login`)
      .flush({ access_token: 'token-123', user: { username: 'ada' } });

    const session = await pending;
    expect(session.accessToken).toBe('token-123');
    expect(session.user.username).toBe('ada');
  });

  it('reports an unreachable server instead of failing silently', async () => {
    // A status-0 failure carries a ProgressEvent, which has no `message` — the
    // case that used to leave the form with nothing to show.
    const pending = firstValueFrom(backend.register(credentials));

    http.expectOne(`${environment.apiUrl}/auth/register`)
      .error(new ProgressEvent('error'));

    await expectAsync(pending)
      .toBeRejectedWithError('Cannot reach the server. Please try again later.');
  });

  it('surfaces the server message when there is one', async () => {
    const pending = firstValueFrom(backend.register(credentials));

    http.expectOne(`${environment.apiUrl}/auth/register`)
      .flush({ message: 'Username already exists' }, { status: 409, statusText: 'Conflict' });

    await expectAsync(pending).toBeRejectedWithError('Username already exists');
  });

  it('falls back to a generic message for an unhelpful error', async () => {
    const pending = firstValueFrom(backend.login(credentials));

    http.expectOne(`${environment.apiUrl}/auth/login`)
      .flush(null, { status: 500, statusText: 'Server Error' });

    await expectAsync(pending).toBeRejectedWithError('Something went wrong. Please try again.');
  });
});

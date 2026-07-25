import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { LocalAuthBackend } from './local-auth.backend';
import { installFakeStorage } from 'src/app/testing/test-utils';

/**
 * The account list is keyed by the lowercased username while the account itself
 * keeps the name as typed, so two things have to stay true at once: "Ada" and
 * "ada" are one account, and "Ada" is what the player is called on screen. The
 * suite above only ever registers the same string twice, which cannot tell the
 * two rules apart.
 */
describe('LocalAuthBackend', () => {
  let backend: LocalAuthBackend;

  beforeEach(() => {
    installFakeStorage();
    TestBed.configureTestingModule({});
    backend = TestBed.inject(LocalAuthBackend);
  });

  it('treats a name as taken whatever the casing, and leaves the first account intact', async () => {
    await firstValueFrom(backend.register({ username: 'Ada', password: 'lovelace1' }));

    await expectAsync(firstValueFrom(backend.register({ username: 'ADA', password: 'intruder1' })))
      .toBeRejectedWithError('That username is already taken.');

    // The stored account is keyed by the lowercased name, so a duplicate check
    // that compares the raw name lets the second sign-up through and writes it
    // straight over the first: the original password stops working and the name
    // now belongs to whoever claimed it second.
    const session = await firstValueFrom(backend.login({ username: 'ada', password: 'lovelace1' }));
    expect(session.user.username).toBe('Ada');

    await expectAsync(firstValueFrom(backend.login({ username: 'Ada', password: 'intruder1' })))
      .toBeRejectedWithError('Incorrect username or password.');
  });

  it('signs the player back in under the name they typed, and only with the password they typed', async () => {
    await firstValueFrom(backend.register({ username: '  Ada  ', password: 'Lovelace1' }));

    // Surrounding space is trimmed at sign-up, so it has to be trimmed at
    // sign-in too — otherwise the account exists under a name the player can
    // never type again.
    const session = await firstValueFrom(backend.login({ username: 'ADA ', password: 'Lovelace1' }));
    expect(session.user.username).toBe('Ada');
    expect(session.accessToken).toBeTruthy();

    // The username is normalised; the password must not be.
    await expectAsync(firstValueFrom(backend.login({ username: 'ada', password: 'lovelace1' })))
      .toBeRejectedWithError('Incorrect username or password.');
  });

  it('reads an unusable account list as no accounts rather than throwing', async () => {
    localStorage.setItem('clicker.auth.users', 'not json at all');

    // A corrupt list must not make sign-up impossible for the rest of the
    // session: the throw would escape the observable and leave the form dead.
    const session = await firstValueFrom(backend.register({ username: 'ada', password: 'lovelace1' }));
    expect(session.user.username).toBe('ada');
  });
});

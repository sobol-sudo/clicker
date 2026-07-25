import { inject, InjectionToken } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthBackend } from './auth.models';
import { LocalAuthBackend } from './local-auth.backend';
import { RemoteAuthBackend } from './remote-auth.backend';

/**
 * Picks the auth implementation at injection time. The deployed demo has no
 * API behind it, so it resolves to LocalAuthBackend; setting
 * `environment.useRemoteAuth` to true swaps in the HTTP implementation with no
 * other change anywhere in the app.
 */
export const AUTH_BACKEND = new InjectionToken<AuthBackend>('AUTH_BACKEND', {
  providedIn: 'root',
  factory: () => (environment.useRemoteAuth ? inject(RemoteAuthBackend) : inject(LocalAuthBackend))
});

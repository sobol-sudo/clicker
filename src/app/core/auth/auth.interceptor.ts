import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthSessionStore } from './auth-session.store';

/** Attaches the access token to API calls so no service hand-builds headers. */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private store = inject(AuthSessionStore);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.store.token;

    if (!token || !req.url.startsWith(environment.apiUrl)) {
      return next.handle(req);
    }

    return next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
}

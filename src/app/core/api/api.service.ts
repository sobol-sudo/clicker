import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthApiResponse, AuthCredentials } from '../auth/auth.models';

/**
 * Thin transport layer for the auth API. The access token is attached by
 * AuthInterceptor, so nothing here builds headers by hand.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  registerUser(body: AuthCredentials): Observable<AuthApiResponse> {
    return this.http.post<AuthApiResponse>(`${this.baseUrl}/auth/register`, body);
  }

  loginUser(body: AuthCredentials): Observable<AuthApiResponse> {
    return this.http.post<AuthApiResponse>(`${this.baseUrl}/auth/login`, body);
  }
}

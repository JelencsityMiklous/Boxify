import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

export interface LoginResponse {
  token: string;
  user?: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'boxify_token';

  constructor(private http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  set token(value: string | null) {
    if (value) localStorage.setItem(this.tokenKey, value);
    else localStorage.removeItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  logout(): void {
    this.token = null;
  }

  register(payload: { name: string; email: string; password: string; confirm?: string }) {
    return this.http.post(`${environment.apiBaseUrl}/auth/register`, payload);
  }

  login(payload: { email: string; password: string }) {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, payload)
      .pipe(tap(r => (this.token = r.token)));
  }

  me() {
    return this.http.get(`${environment.apiBaseUrl}/auth/me`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
  }

  getUserRole(): string | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch (e) {
      return null;
    }
  }

  getCurrentUser(): User | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.id || payload.userId,
        username: payload.username,
        email: payload.email,
        role: payload.role
      };
    } catch (e) {
      return null;
    }
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  register(userData: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
}

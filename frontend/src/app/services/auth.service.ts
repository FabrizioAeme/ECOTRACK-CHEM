import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest } from '../models/auth.interfaces';

interface JwtPayload {
  sub?: string;
  exp?: number;
}

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly NOMBRE_COOKIE = 'jwt_token';

  readonly correoUsuario = signal<string | null>(this.leerCorreoDelToken());

  login(credenciales: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/authenticate`, credenciales)
      .pipe(tap((response) => this.setToken(response.access_token)));
  }

  setToken(token: string): void {
    document.cookie = `${this.NOMBRE_COOKIE}=${token}; path=/; max-age=604800; samesite=strict`;
    this.correoUsuario.set(this.leerCorreoDelToken());
  }

  getToken(): string | null {
    const match = document.cookie.match(new RegExp(`(^| )${this.NOMBRE_COOKIE}=([^;]+)`));
    return match ? match[2] : null;
  }

  isAutenticado(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const exp = this.decodificar(token)?.exp;
    return !!exp && exp * 1000 > Date.now();
  }

  cerrarSesion(): void {
    document.cookie = `${this.NOMBRE_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    this.correoUsuario.set(null);
  }

  private leerCorreoDelToken(): string | null {
    const token = this.getToken();
    return token ? (this.decodificar(token)?.sub ?? null) : null;
  }

  private decodificar(token: string): JwtPayload | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64)) as JwtPayload;
    } catch {
      return null;
    }
  }
}

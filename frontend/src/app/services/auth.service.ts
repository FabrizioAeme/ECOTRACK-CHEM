import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthResponse,
  JwtPayload,
  LoginRequest,
  RegistroRequest,
  RegistroResponse,
  Sesion,
} from '../models/auth.interfaces';
import { RolUsuario } from '../models/usuario.interface';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private enrutador = inject(Router);
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly NOMBRE_COOKIE = 'ecotrack_jwt';
  private temporizadorExpiracion: ReturnType<typeof setTimeout> | null = null;

  readonly sesion = signal<Sesion | null>(null);
  readonly correoUsuario = computed(() => this.sesion()?.correo ?? null);
  readonly nombreUsuario = computed(() => this.sesion()?.nombre ?? '');
  readonly rol = computed(() => this.sesion()?.rol ?? null);
  readonly esAdministrador = computed(() => this.rol() === 'ADMINISTRADOR');
  readonly puedeAuditar = computed(() => this.rol() === 'ADMINISTRADOR' || this.rol() === 'AUDITOR_AMBIENTAL');

  constructor() {
    this.restaurarSesion();
  }

  login(credenciales: LoginRequest) {
    const datos = { correo: credenciales.correo.trim().toLowerCase(), clave: credenciales.clave };
    return this.http
      .post<AuthResponse>(`${this.API_URL}/authenticate`, datos)
      .pipe(tap((response) => this.setToken(response.access_token)));
  }

  registrar(datos: RegistroRequest) {
    return this.http.post<RegistroResponse>(`${this.API_URL}/register`, {
      ...datos,
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo.trim().toLowerCase(),
    });
  }

  setToken(token: string): void {
    const sesion = this.crearSesion(token);
    if (!sesion) {
      this.cerrarSesion();
      throw new Error('El servidor devolvió un token inválido o expirado');
    }
    const segundosRestantes = Math.floor((sesion.expiraEn - Date.now()) / 1000);
    const seguro = location.protocol === 'https:' ? '; secure' : '';
    document.cookie = `${this.NOMBRE_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${segundosRestantes}; samesite=strict${seguro}`;
    this.sesion.set(sesion);
    this.programarExpiracion(sesion);
  }

  getToken(): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${this.NOMBRE_COOKIE}=([^;]+)`));
    return match ? decodeURIComponent(match[1]) : null;
  }

  isAutenticado(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const sesion = this.crearSesion(token);
    if (!sesion) {
      this.cerrarSesion();
      return false;
    }
    if (this.sesion()?.expiraEn !== sesion.expiraEn) {
      this.sesion.set(sesion);
      this.programarExpiracion(sesion);
    }
    return true;
  }

  tieneRol(...roles: RolUsuario[]): boolean {
    const rol = this.rol();
    return !!rol && roles.includes(rol);
  }

  cerrarSesion(): void {
    document.cookie = `${this.NOMBRE_COOKIE}=; path=/; max-age=0; samesite=strict`;
    this.sesion.set(null);
    if (this.temporizadorExpiracion) {
      clearTimeout(this.temporizadorExpiracion);
      this.temporizadorExpiracion = null;
    }
  }

  private restaurarSesion(): void {
    const token = this.getToken();
    if (!token) {
      return;
    }
    const sesion = this.crearSesion(token);
    if (sesion) {
      this.sesion.set(sesion);
      this.programarExpiracion(sesion);
    } else {
      this.cerrarSesion();
    }
  }

  private programarExpiracion(sesion: Sesion): void {
    if (this.temporizadorExpiracion) {
      clearTimeout(this.temporizadorExpiracion);
    }
    const restante = Math.min(sesion.expiraEn - Date.now(), 2_147_000_000);
    this.temporizadorExpiracion = setTimeout(() => {
      this.cerrarSesion();
      this.enrutador.navigate(['/login'], { queryParams: { expirada: 'true' } });
    }, restante);
  }

  private crearSesion(token: string): Sesion | null {
    const payload = this.decodificar(token);
    if (!payload?.sub || !payload.exp || payload.exp * 1000 <= Date.now()) {
      return null;
    }
    return {
      correo: payload.sub,
      nombre: payload.nombre ?? payload.sub,
      rol: payload.rol ?? null,
      id: payload.id ?? null,
      expiraEn: payload.exp * 1000,
    };
  }

  private decodificar(token: string): JwtPayload | null {
    const partes = token.split('.');
    if (partes.length !== 3) {
      return null;
    }
    try {
      const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join(''),
      );
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }
}

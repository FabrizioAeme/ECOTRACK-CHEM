import { RolUsuario } from './usuario.interface';

export interface LoginRequest {
  correo: string;
  clave: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface RegistroRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  clave: string;
}

export interface RegistroResponse {
  correo: string;
  estado: 'INFORMATION' | 'WARNING';
  mensaje: string;
}

export interface JwtPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  rol?: RolUsuario;
  nombre?: string;
  id?: number;
}

export interface Sesion {
  correo: string;
  nombre: string;
  rol: RolUsuario | null;
  id: number | null;
  expiraEn: number;
}

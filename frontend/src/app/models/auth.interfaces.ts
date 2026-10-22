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

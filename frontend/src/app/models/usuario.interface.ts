import { OpcionCatalogo } from './opcion-catalogo.interface';

export type RolUsuario = 'ADMINISTRADOR' | 'OPERADOR_LABORATORIO' | 'AUDITOR_AMBIENTAL';

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: RolUsuario;
}

export const ROLES_USUARIO: OpcionCatalogo<RolUsuario>[] = [
  { valor: 'ADMINISTRADOR', etiqueta: 'Administrador', color: 'dark', icono: 'bi-shield-lock' },
  { valor: 'OPERADOR_LABORATORIO', etiqueta: 'Operador de laboratorio', color: 'info', icono: 'bi-person-gear' },
  { valor: 'AUDITOR_AMBIENTAL', etiqueta: 'Auditor ambiental', color: 'success', icono: 'bi-clipboard-check' },
];

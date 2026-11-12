import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RolUsuario } from '../models/usuario.interface';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const enrutador = inject(Router);

  if (authService.isAutenticado()) {
    return true;
  }

  authService.cerrarSesion();
  return enrutador.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const invitadoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const enrutador = inject(Router);

  if (!authService.isAutenticado()) {
    return true;
  }

  return enrutador.createUrlTree(['/dashboard']);
};

export const rolGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const enrutador = inject(Router);
  const notificacion = inject(NotificacionService);
  const roles = (route.data['roles'] ?? []) as RolUsuario[];

  if (!authService.isAutenticado()) {
    return enrutador.createUrlTree(['/login']);
  }
  if (roles.length === 0 || authService.tieneRol(...roles)) {
    return true;
  }

  notificacion.advertencia('Tu rol no tiene acceso a esa sección.', 'Acceso restringido');
  return enrutador.createUrlTree(['/dashboard']);
};

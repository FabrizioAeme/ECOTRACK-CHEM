import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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

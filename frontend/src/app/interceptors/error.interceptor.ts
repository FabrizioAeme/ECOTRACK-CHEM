import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const enrutador = inject(Router);
  const notificacion = inject(NotificacionService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const esRutaAuth = req.url.includes('/auth/');

      if (!esRutaAuth && (error.status === 401 || error.status === 403)) {
        if (authService.getToken()) {
          authService.cerrarSesion();
          notificacion.advertencia(
            'Tu sesión expiró. Vuelve a iniciar sesión para continuar.',
            'Sesión finalizada',
          );
          enrutador.navigate(['/login']);
        }
        return EMPTY;
      }

      return throwError(() => error);
    }),
  );
};

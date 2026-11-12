import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const esApiPropia = req.url.startsWith(environment.apiUrl);
  const esRutaAuth = req.url.includes('/auth/');

  if (esApiPropia && !esRutaAuth && authService.isAutenticado()) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
    });
  }

  return next(req);
};

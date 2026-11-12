import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';
import { crearJwtPrueba, limpiarCookies } from '../testing/jwt-prueba';
import { authInterceptor } from './auth.interceptor';
import { errorInterceptor } from './error.interceptor';

describe('Interceptores HTTP', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let auth: AuthService;
  let enrutador: Router;
  const url = `${environment.apiUrl}/api/v1/insumos`;

  beforeEach(() => {
    limpiarCookies();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    enrutador = TestBed.inject(Router);
  });

  afterEach(() => {
    auth.cerrarSesion();
    backend.verify();
  });

  it('agrega el header Authorization a los endpoints protegidos', () => {
    const token = crearJwtPrueba({ sub: 'admin@ecotrackchem.com', rol: 'ADMINISTRADOR' });
    auth.setToken(token);

    http.get(url).subscribe();

    const peticion = backend.expectOne(url);
    expect(peticion.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    peticion.flush([]);
  });

  it('no envía el token al endpoint de login', () => {
    auth.setToken(crearJwtPrueba({ sub: 'admin@ecotrackchem.com' }));
    http.post(`${environment.apiUrl}/auth/authenticate`, {}).subscribe();
    const peticion = backend.expectOne(`${environment.apiUrl}/auth/authenticate`);
    expect(peticion.request.headers.has('Authorization')).toBe(false);
    peticion.flush({});
  });

  it('ante un 401 cierra la sesión y redirige al login', () => {
    auth.setToken(crearJwtPrueba({ sub: 'admin@ecotrackchem.com' }));
    const navegar = vi.spyOn(enrutador, 'navigate').mockResolvedValue(true);
    const aviso = vi.spyOn(TestBed.inject(NotificacionService), 'advertencia');

    http.get(url).subscribe();
    backend.expectOne(url).flush({ error: 'expirado' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.getToken()).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/login'], expect.anything());
    expect(aviso).toHaveBeenCalled();
  });

  it('un 403 no cierra la sesión y llega al componente', () => {
    auth.setToken(crearJwtPrueba({ sub: 'ana@ecotrackchem.com', rol: 'OPERADOR_LABORATORIO' }));
    let estado = 0;

    http.delete(`${url}/1`).subscribe({ error: (err) => (estado = err.status) });
    backend.expectOne(`${url}/1`).flush({ error: 'Sin permisos' }, { status: 403, statusText: 'Forbidden' });

    expect(estado).toBe(403);
    expect(auth.isAutenticado()).toBe(true);
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { crearJwtPrueba, limpiarCookies } from '../testing/jwt-prueba';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let servicio: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    limpiarCookies();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    servicio.cerrarSesion();
    http.verify();
  });

  it('inicia sesión, guarda el token en la cookie y lee el rol del JWT', () => {
    const token = crearJwtPrueba({ sub: 'admin@ecotrackchem.com', rol: 'ADMINISTRADOR', nombre: 'Admin Eco', id: 1 });

    servicio.login({ correo: ' ADMIN@ecotrackchem.com ', clave: 'password123' }).subscribe();
    const peticion = http.expectOne(`${environment.apiUrl}/auth/authenticate`);
    expect(peticion.request.body.correo).toBe('admin@ecotrackchem.com');
    peticion.flush({ access_token: token, refresh_token: 'r' });

    expect(servicio.getToken()).toBe(token);
    expect(servicio.isAutenticado()).toBe(true);
    expect(servicio.correoUsuario()).toBe('admin@ecotrackchem.com');
    expect(servicio.nombreUsuario()).toBe('Admin Eco');
    expect(servicio.esAdministrador()).toBe(true);
    expect(servicio.tieneRol('AUDITOR_AMBIENTAL')).toBe(false);
  });

  it('no acepta un token vencido', () => {
    const vencido = crearJwtPrueba({ sub: 'ana@ecotrackchem.com' }, -60);
    expect(() => servicio.setToken(vencido)).toThrow();
    expect(servicio.getToken()).toBeNull();
    expect(servicio.isAutenticado()).toBe(false);
  });

  it('no acepta un token mal formado', () => {
    expect(() => servicio.setToken('esto-no-es-un-jwt')).toThrow();
    expect(servicio.isAutenticado()).toBe(false);
  });

  it('cerrar sesión elimina el token y los datos del usuario', () => {
    servicio.setToken(crearJwtPrueba({ sub: 'ana@ecotrackchem.com', rol: 'OPERADOR_LABORATORIO' }));
    expect(servicio.isAutenticado()).toBe(true);

    servicio.cerrarSesion();

    expect(servicio.getToken()).toBeNull();
    expect(servicio.sesion()).toBeNull();
    expect(servicio.isAutenticado()).toBe(false);
  });

  it('un auditor ambiental puede auditar pero no es administrador', () => {
    servicio.setToken(crearJwtPrueba({ sub: 'luz@ecotrackchem.com', rol: 'AUDITOR_AMBIENTAL' }));
    expect(servicio.puedeAuditar()).toBe(true);
    expect(servicio.esAdministrador()).toBe(false);
  });
});

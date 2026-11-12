import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { crearJwtPrueba, limpiarCookies } from '../testing/jwt-prueba';
import { authGuard, invitadoGuard, rolGuard } from './auth.guard';

describe('Guards de autenticación', () => {
  let auth: AuthService;
  let enrutador: Router;
  const estado = { url: '/lotes' } as RouterStateSnapshot;

  const ruta = (roles?: string[]) => ({ data: roles ? { roles } : {} }) as unknown as ActivatedRouteSnapshot;
  const ejecutar = (guard: typeof authGuard, snapshot = ruta()) =>
    TestBed.runInInjectionContext(() => guard(snapshot, estado));

  beforeEach(() => {
    limpiarCookies();
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });
    auth = TestBed.inject(AuthService);
    enrutador = TestBed.inject(Router);
  });

  afterEach(() => auth.cerrarSesion());

  it('authGuard redirige al login con returnUrl si no hay sesión', () => {
    const resultado = ejecutar(authGuard) as UrlTree;
    expect(enrutador.serializeUrl(resultado)).toBe('/login?returnUrl=%2Flotes');
  });

  it('authGuard deja pasar con un token vigente', () => {
    auth.setToken(crearJwtPrueba({ sub: 'ana@ecotrackchem.com', rol: 'OPERADOR_LABORATORIO' }));
    expect(ejecutar(authGuard)).toBe(true);
  });

  it('invitadoGuard envía al panel a quien ya inició sesión', () => {
    auth.setToken(crearJwtPrueba({ sub: 'ana@ecotrackchem.com', rol: 'OPERADOR_LABORATORIO' }));
    const resultado = ejecutar(invitadoGuard) as UrlTree;
    expect(enrutador.serializeUrl(resultado)).toBe('/dashboard');
  });

  it('rolGuard bloquea a un operador en una ruta de administrador', () => {
    auth.setToken(crearJwtPrueba({ sub: 'ana@ecotrackchem.com', rol: 'OPERADOR_LABORATORIO' }));
    const resultado = ejecutar(rolGuard, ruta(['ADMINISTRADOR'])) as UrlTree;
    expect(enrutador.serializeUrl(resultado)).toBe('/dashboard');
  });

  it('rolGuard permite al administrador', () => {
    auth.setToken(crearJwtPrueba({ sub: 'admin@ecotrackchem.com', rol: 'ADMINISTRADOR' }));
    expect(ejecutar(rolGuard, ruta(['ADMINISTRADOR']))).toBe(true);
  });
});

import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Layout } from './components/layout/layout';
import { Dashboard } from './components/dashboard/dashboard';
import { Error404 } from './components/error404/error404';
import { authGuard, invitadoGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Iniciar sesión | EcoTrack Chem', canActivate: [invitadoGuard] },
  { path: 'registro', component: Registro, title: 'Crear cuenta | EcoTrack Chem', canActivate: [invitadoGuard] },

  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard, title: 'Panel de control | EcoTrack Chem' },
      { path: 'insumos', loadChildren: () => import('./components/insumos/insumos.routes').then((m) => m.INSUMOS_ROUTES) },
      { path: 'lotes', loadChildren: () => import('./components/lotes/lotes.routes').then((m) => m.LOTES_ROUTES) },
      { path: 'residuos', loadChildren: () => import('./components/residuos/residuos.routes').then((m) => m.RESIDUOS_ROUTES) },
      { path: 'usuarios', loadChildren: () => import('./components/usuarios/usuarios.routes').then((m) => m.USUARIOS_ROUTES) },
    ],
  },

  { path: '**', component: Error404, title: 'Página no encontrada | EcoTrack Chem' },
];

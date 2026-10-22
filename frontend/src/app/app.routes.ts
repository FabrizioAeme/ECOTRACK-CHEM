import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Error404 } from './components/error404/error404';
import { invitadoGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login, title: 'Iniciar sesión | EcoTrack Chem', canActivate: [invitadoGuard] },
  { path: 'registro', component: Registro, title: 'Crear cuenta | EcoTrack Chem', canActivate: [invitadoGuard] },

  { path: '**', component: Error404, title: 'Página no encontrada | EcoTrack Chem' },
];

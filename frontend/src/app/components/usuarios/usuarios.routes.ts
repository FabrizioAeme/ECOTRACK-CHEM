import { Routes } from '@angular/router';
import { UsuarioList } from './usuario-list/usuario-list';

export const USUARIOS_ROUTES: Routes = [
  { path: '', component: UsuarioList, title: 'Usuarios | EcoTrack Chem' },
];

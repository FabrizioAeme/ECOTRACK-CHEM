import { Routes } from '@angular/router';
import { ResiduoForm } from './residuo-form/residuo-form';
import { ResiduoList } from './residuo-list/residuo-list';

export const RESIDUOS_ROUTES: Routes = [
  { path: '', component: ResiduoList, title: 'Residuos industriales | EcoTrack Chem' },
  { path: 'nuevo', component: ResiduoForm, title: 'Nuevo residuo | EcoTrack Chem' },
  { path: ':id/editar', component: ResiduoForm, title: 'Editar residuo | EcoTrack Chem' },
];

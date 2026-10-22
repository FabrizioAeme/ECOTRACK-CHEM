import { Routes } from '@angular/router';
import { InsumoForm } from './insumo-form/insumo-form';
import { InsumoList } from './insumo-list/insumo-list';

export const INSUMOS_ROUTES: Routes = [
  { path: '', component: InsumoList, title: 'Insumos químicos | EcoTrack Chem' },
  { path: 'nuevo', component: InsumoForm, title: 'Nuevo insumo | EcoTrack Chem' },
  { path: ':id/editar', component: InsumoForm, title: 'Editar insumo | EcoTrack Chem' },
];

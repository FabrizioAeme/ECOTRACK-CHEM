import { Routes } from '@angular/router';
import { LoteForm } from './lote-form/lote-form';
import { LoteList } from './lote-list/lote-list';

export const LOTES_ROUTES: Routes = [
  { path: '', component: LoteList, title: 'Lotes de producción | EcoTrack Chem' },
  { path: 'nuevo', component: LoteForm, title: 'Nuevo lote | EcoTrack Chem' },
  { path: ':id/editar', component: LoteForm, title: 'Editar lote | EcoTrack Chem' },
];

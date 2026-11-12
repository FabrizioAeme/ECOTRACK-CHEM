import { Service } from '@angular/core';
import { Lote, LoteRequest } from '../models/lote.interface';
import { CrudService } from './crud.service';

@Service()
export class LoteService extends CrudService<Lote, LoteRequest> {
  protected override readonly recurso = 'lotes';
  protected override readonly parametroFiltro = 'estado';
}

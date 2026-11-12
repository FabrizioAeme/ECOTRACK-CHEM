import { Service } from '@angular/core';
import { InsumoQuimico, InsumoQuimicoRequest } from '../models/insumo.interface';
import { CrudService } from './crud.service';

@Service()
export class InsumoService extends CrudService<InsumoQuimico, InsumoQuimicoRequest> {
  protected override readonly recurso = 'insumos';
  protected override readonly parametroFiltro = 'nivelPeligrosidad';
}

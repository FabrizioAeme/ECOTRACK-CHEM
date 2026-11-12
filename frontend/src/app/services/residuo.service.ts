import { Service } from '@angular/core';
import { ResiduoIndustrial, ResiduoIndustrialRequest } from '../models/residuo.interface';
import { CrudService } from './crud.service';

@Service()
export class ResiduoService extends CrudService<ResiduoIndustrial, ResiduoIndustrialRequest> {
  protected override readonly recurso = 'residuos';
  protected override readonly parametroFiltro = 'disposicionFinal';
}

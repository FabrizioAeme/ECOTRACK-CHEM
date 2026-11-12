import { OpcionCatalogo } from './opcion-catalogo.interface';

export type DisposicionFinal = 'NEUTRALIZADO' | 'RECICLADO_REUSO' | 'RECOGIDA_ESPECIAL';

export interface ResiduoIndustrial {
  id: number;
  tipoResiduo: string;
  volumenLitros: number;
  disposicionFinal: DisposicionFinal;
  requiereCertificado: boolean;
  loteId: number;
  loteCodigo: string;
}

export interface ResiduoIndustrialRequest {
  tipoResiduo: string;
  volumenLitros: number;
  disposicionFinal: DisposicionFinal;
  requiereCertificado: boolean;
  loteId: number;
}

export const DISPOSICIONES_FINALES: OpcionCatalogo<DisposicionFinal>[] = [
  {
    valor: 'NEUTRALIZADO',
    etiqueta: 'Neutralizado',
    color: 'info',
    icono: 'bi-droplet',
    descripcion: 'Tratado químicamente para eliminar su peligrosidad',
  },
  {
    valor: 'RECICLADO_REUSO',
    etiqueta: 'Reciclado / Reúso',
    color: 'success',
    icono: 'bi-recycle',
    descripcion: 'Vuelve a un proceso productivo (economía circular)',
  },
  {
    valor: 'RECOGIDA_ESPECIAL',
    etiqueta: 'Recogida especial',
    color: 'warning',
    icono: 'bi-truck',
    descripcion: 'Entregado a una empresa operadora de residuos autorizada',
  },
];

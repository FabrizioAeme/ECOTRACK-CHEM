import { OpcionCatalogo } from './opcion-catalogo.interface';

export type EstadoLote = 'EN_PROCESO' | 'FINALIZADO' | 'AUDITADO';

export interface Lote {
  id: number;
  codigoLote: string;
  fechaFabricacion: string;
  volumenProducido: number;
  estado: EstadoLote;
  usuarioId: number;
  usuarioNombre: string;
  insumoId: number;
  insumoNombre: string;
}

export interface LoteRequest {
  codigoLote: string;
  fechaFabricacion: string;
  volumenProducido: number;
  estado: EstadoLote;
  usuarioId: number;
  insumoId: number;
}

export const ESTADOS_LOTE: OpcionCatalogo<EstadoLote>[] = [
  { valor: 'EN_PROCESO', etiqueta: 'En proceso', color: 'info', icono: 'bi-hourglass-split', descripcion: 'La producción aún no termina' },
  { valor: 'FINALIZADO', etiqueta: 'Finalizado', color: 'success', icono: 'bi-check-circle', descripcion: 'Producción terminada' },
  { valor: 'AUDITADO', etiqueta: 'Auditado', color: 'dark', icono: 'bi-patch-check', descripcion: 'Revisado por auditoría ambiental' },
];

import { OpcionCatalogo } from './opcion-catalogo.interface';

export type NivelPeligrosidad = 'INFLAMABLE' | 'CORROSIVO' | 'TOXICO' | 'NEUTRO';

export interface InsumoQuimico {
  id: number;
  codigoCas: string;
  nombre: string;
  nivelPureza: number;
  nivelPeligrosidad: NivelPeligrosidad;
  stockDisponible: number;
}

export type InsumoQuimicoRequest = Omit<InsumoQuimico, 'id'>;

export const PATRON_CAS = /^\d{2,7}-\d{2}-\d$/;

export const NIVELES_PELIGROSIDAD: OpcionCatalogo<NivelPeligrosidad>[] = [
  { valor: 'INFLAMABLE', etiqueta: 'Inflamable', color: 'danger', icono: 'bi-fire', descripcion: 'Puede encenderse con facilidad' },
  { valor: 'CORROSIVO', etiqueta: 'Corrosivo', color: 'warning', icono: 'bi-droplet-half', descripcion: 'Daña metales y tejidos' },
  { valor: 'TOXICO', etiqueta: 'Tóxico', color: 'dark', icono: 'bi-exclamation-octagon', descripcion: 'Nocivo para la salud' },
  { valor: 'NEUTRO', etiqueta: 'Neutro', color: 'secondary', icono: 'bi-shield-check', descripcion: 'Sin peligrosidad relevante' },
];

export interface PaginaResponse<T> {
  contenido: T[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
  primera: boolean;
  ultima: boolean;
}

export interface ConsultaPaginada {
  buscar: string;
  filtro: string;
  pagina: number;
  tamanio: number;
  ordenarPor: string;
  direccion: 'asc' | 'desc';
}

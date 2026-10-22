export interface OpcionCatalogo<T extends string = string> {
  valor: T;
  etiqueta: string;
  color: string;
  icono: string;
  descripcion?: string;
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ConsultaPaginada, PaginaResponse } from '../models/pagina.interface';

export abstract class CrudService<T, TRequest> {
  protected readonly http = inject(HttpClient);
  protected abstract readonly recurso: string;
  protected abstract readonly parametroFiltro: string;

  protected get url(): string {
    return `${environment.apiUrl}/api/v1/${this.recurso}`;
  }

  listar(): Observable<T[]> {
    return this.http.get<T[]>(this.url);
  }

  listarPaginado(consulta: ConsultaPaginada): Observable<PaginaResponse<T>> {
    let params = new HttpParams()
      .set('pagina', consulta.pagina)
      .set('tamanio', consulta.tamanio)
      .set('ordenarPor', consulta.ordenarPor)
      .set('direccion', consulta.direccion);
    if (consulta.buscar.trim()) {
      params = params.set('buscar', consulta.buscar.trim());
    }
    if (consulta.filtro) {
      params = params.set(this.parametroFiltro, consulta.filtro);
    }
    return this.http.get<PaginaResponse<T>>(`${this.url}/paginado`, { params });
  }

  obtener(id: number): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  crear(datos: TRequest): Observable<T> {
    return this.http.post<T>(this.url, datos);
  }

  actualizar(id: number, datos: TRequest): Observable<T> {
    return this.http.put<T>(`${this.url}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

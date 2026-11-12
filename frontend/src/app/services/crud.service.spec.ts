import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { LoteService } from './lote.service';

describe('Consumo paginado (CrudService)', () => {
  it('envía página, tamaño, orden, búsqueda y filtro como parámetros', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const servicio = TestBed.inject(LoteService);
    const backend = TestBed.inject(HttpTestingController);
    let total = 0;

    servicio
      .listarPaginado({ buscar: ' LOT ', filtro: 'EN_PROCESO', pagina: 2, tamanio: 5, ordenarPor: 'fechaFabricacion', direccion: 'desc' })
      .subscribe((pagina) => (total = pagina.totalElementos));

    const peticion = backend.expectOne((r) => r.url === `${environment.apiUrl}/api/v1/lotes/paginado`);
    const params = peticion.request.params;
    expect(params.get('pagina')).toBe('2');
    expect(params.get('tamanio')).toBe('5');
    expect(params.get('ordenarPor')).toBe('fechaFabricacion');
    expect(params.get('direccion')).toBe('desc');
    expect(params.get('buscar')).toBe('LOT');
    expect(params.get('estado')).toBe('EN_PROCESO');
    peticion.flush({ contenido: [], pagina: 2, tamanio: 5, totalElementos: 11, totalPaginas: 3, primera: false, ultima: true });

    expect(total).toBe(11);
    backend.verify();
  });

  it('omite búsqueda y filtro cuando están vacíos', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const servicio = TestBed.inject(LoteService);
    const backend = TestBed.inject(HttpTestingController);

    servicio.listarPaginado({ buscar: '', filtro: '', pagina: 0, tamanio: 10, ordenarPor: 'id', direccion: 'asc' }).subscribe();

    const peticion = backend.expectOne((r) => r.url.endsWith('/lotes/paginado'));
    expect(peticion.request.params.has('buscar')).toBe(false);
    expect(peticion.request.params.has('estado')).toBe(false);
    peticion.flush({ contenido: [], pagina: 0, tamanio: 10, totalElementos: 0, totalPaginas: 0, primera: true, ultima: true });
    backend.verify();
  });
});

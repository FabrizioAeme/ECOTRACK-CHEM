import { TestBed } from '@angular/core/testing';
import { Paginacion } from './paginacion';

describe('Paginacion', () => {
  function crear(pagina: number, totalPaginas: number, totalElementos: number, tamanio = 10, cantidad = 10) {
    const fixture = TestBed.createComponent(Paginacion);
    fixture.componentRef.setInput('pagina', pagina);
    fixture.componentRef.setInput('totalPaginas', totalPaginas);
    fixture.componentRef.setInput('totalElementos', totalElementos);
    fixture.componentRef.setInput('tamanio', tamanio);
    fixture.componentRef.setInput('cantidadEnPagina', cantidad);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra el rango de registros de la página actual', () => {
    const fixture = crear(1, 3, 25, 10, 10);
    expect(fixture.nativeElement.textContent).toContain('11–20');
    expect(fixture.nativeElement.textContent).toContain('25');
  });

  it('resume páginas largas con puntos suspensivos', () => {
    const fixture = crear(5, 12, 120);
    expect(fixture.componentInstance.paginas()).toEqual([0, null, 4, 5, 6, null, 11]);
  });

  it('emite la página siguiente al hacer clic', () => {
    const fixture = crear(0, 3, 25);
    let emitida = -1;
    fixture.componentInstance.cambiarPagina.subscribe((p) => (emitida = p));
    const botones: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button.page-link'));
    botones[botones.length - 1].click();
    expect(emitida).toBe(1);
  });
});

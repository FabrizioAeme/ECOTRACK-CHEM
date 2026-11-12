import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-paginacion',
  template: `
    <div class="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 px-3 py-2 border-top">
      <div class="small text-body-secondary">
        @if (totalElementos() > 0) {
          Mostrando <strong>{{ desde() }}–{{ hasta() }}</strong> de <strong>{{ totalElementos() }}</strong>
        } @else {
          Sin registros
        }
      </div>

      <div class="d-flex align-items-center gap-3">
        <div class="d-flex align-items-center gap-2 small">
          <label for="tamanio-pagina" class="text-body-secondary text-nowrap">Por página</label>
          <select id="tamanio-pagina" class="form-select form-select-sm" style="width: auto"
            [value]="tamanio()" (change)="alCambiarTamanio($event)">
            @for (opcion of opcionesTamanio; track opcion) {
              <option [value]="opcion" [selected]="opcion === tamanio()">{{ opcion }}</option>
            }
          </select>
        </div>

        <nav aria-label="Paginación">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" [class.disabled]="pagina() === 0">
              <button type="button" class="page-link" aria-label="Página anterior" [disabled]="pagina() === 0"
                (click)="cambiarPagina.emit(pagina() - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            @for (item of paginas(); track $index) {
              @if (item === null) {
                <li class="page-item disabled"><span class="page-link">…</span></li>
              } @else {
                <li class="page-item" [class.active]="item === pagina()">
                  <button type="button" class="page-link" [attr.aria-current]="item === pagina() ? 'page' : null"
                    (click)="cambiarPagina.emit(item)">
                    {{ item + 1 }}
                  </button>
                </li>
              }
            }
            <li class="page-item" [class.disabled]="esUltima()">
              <button type="button" class="page-link" aria-label="Página siguiente" [disabled]="esUltima()"
                (click)="cambiarPagina.emit(pagina() + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  `,
})
export class Paginacion {
  readonly pagina = input.required<number>();
  readonly totalPaginas = input.required<number>();
  readonly totalElementos = input.required<number>();
  readonly tamanio = input.required<number>();
  readonly cantidadEnPagina = input(0);

  readonly cambiarPagina = output<number>();
  readonly cambiarTamanio = output<number>();

  readonly opcionesTamanio = [5, 10, 20, 50];

  readonly desde = computed(() => (this.totalElementos() === 0 ? 0 : this.pagina() * this.tamanio() + 1));
  readonly hasta = computed(() => this.pagina() * this.tamanio() + this.cantidadEnPagina());
  readonly esUltima = computed(() => this.pagina() >= this.totalPaginas() - 1);

  readonly paginas = computed<(number | null)[]>(() => {
    const total = this.totalPaginas();
    const actual = this.pagina();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i);
    }
    const visibles = new Set([0, total - 1, actual - 1, actual, actual + 1].filter((p) => p >= 0 && p < total));
    const ordenadas = [...visibles].sort((a, b) => a - b);
    const resultado: (number | null)[] = [];
    ordenadas.forEach((p, i) => {
      if (i > 0 && p - ordenadas[i - 1] > 1) {
        resultado.push(null);
      }
      resultado.push(p);
    });
    return resultado;
  });

  alCambiarTamanio(evento: Event) {
    this.cambiarTamanio.emit(Number((evento.target as HTMLSelectElement).value));
  }
}

import { Component, computed, input } from '@angular/core';
import { OpcionCatalogo } from '../../../models/opcion-catalogo.interface';

@Component({
  selector: 'app-insignia',
  template: `
    @if (opcion(); as o) {
      <span
        class="badge rounded-pill border fw-semibold"
        [class]="'text-' + o.color + '-emphasis bg-' + o.color + '-subtle border-' + o.color + '-subtle'"
      >
        <i class="bi me-1" [class]="o.icono"></i>{{ o.etiqueta }}
      </span>
    } @else {
      <span class="badge text-bg-light border">{{ valor() }}</span>
    }
  `,
})
export class Insignia {
  readonly valor = input.required<string | null | undefined>();
  readonly opciones = input.required<readonly OpcionCatalogo[]>();

  readonly opcion = computed(() => this.opciones().find((o) => o.valor === this.valor()));
}

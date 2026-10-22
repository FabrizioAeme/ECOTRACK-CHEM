import { Component, input } from '@angular/core';

@Component({
  selector: 'app-encabezado-pagina',
  template: `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div class="d-flex align-items-center gap-3">
        @if (icono()) {
          <span class="icono-encabezado"><i class="bi" [class]="icono()"></i></span>
        }
        <div>
          <h1 class="h3 fw-bold mb-0">{{ titulo() }}</h1>
          @if (subtitulo()) {
            <p class="text-body-secondary mb-0">{{ subtitulo() }}</p>
          }
        </div>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <ng-content />
      </div>
    </div>
  `,
})
export class EncabezadoPagina {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>();
  readonly icono = input<string>();
}

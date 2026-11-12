import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tarjeta-indicador',
  template: `
    <div class="card card-eco h-100">
      <div class="card-body d-flex align-items-start gap-3">
        <div
          class="rounded-3 d-flex align-items-center justify-content-center fs-4 flex-shrink-0"
          style="width: 52px; height: 52px"
          [class]="'bg-' + color() + '-subtle text-' + color()"
        >
          <i class="bi" [class]="icono()"></i>
        </div>
        <div class="min-w-0">
          <div class="small text-body-secondary text-uppercase fw-semibold">{{ titulo() }}</div>
          <div class="fs-3 fw-bold lh-sm">{{ valor() }}</div>
          @if (detalle()) {
            <div class="small text-body-secondary">{{ detalle() }}</div>
          }
        </div>
      </div>
    </div>
  `,
})
export class TarjetaIndicador {
  readonly titulo = input.required<string>();
  readonly valor = input.required<string | number>();
  readonly icono = input('bi-bar-chart');
  readonly color = input('success');
  readonly detalle = input<string>();
}

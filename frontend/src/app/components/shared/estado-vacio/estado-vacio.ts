import { Component, input } from '@angular/core';

@Component({
  selector: 'app-estado-vacio',
  template: `
    <div class="text-center py-5 px-3">
      <div
        class="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center fs-2"
        style="width: 72px; height: 72px; background: var(--eco-primario-claro); color: var(--eco-primario)"
      >
        <i class="bi" [class]="icono()"></i>
      </div>
      <h2 class="h6 fw-bold mb-1">{{ titulo() }}</h2>
      <p class="text-body-secondary small mb-3">{{ mensaje() }}</p>
      <ng-content />
    </div>
  `,
})
export class EstadoVacio {
  readonly icono = input('bi-inbox');
  readonly titulo = input.required<string>();
  readonly mensaje = input('');
}

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-indicador-carga',
  template: `
    <div class="d-flex flex-column align-items-center justify-content-center py-5 text-body-secondary">
      <div class="spinner-border text-success mb-3" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <span>{{ texto() }}</span>
    </div>
  `,
})
export class IndicadorCarga {
  readonly texto = input('Cargando información...');
}

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-aviso-diseno',
  template: `
    <div class="alert alert-info border-0 d-flex align-items-center gap-2 small mb-4" role="note">
      <i class="bi bi-palette fs-5"></i>
      <span>{{ mensaje() }}</span>
    </div>
  `,
})
export class AvisoDiseno {
  readonly mensaje = input(
    'Vista de diseño con datos de ejemplo. La conexión con el backend se implementará en la siguiente entrega.',
  );
}

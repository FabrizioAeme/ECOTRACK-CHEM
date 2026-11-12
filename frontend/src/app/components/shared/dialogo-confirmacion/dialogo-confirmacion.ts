import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-dialogo-confirmacion',
  host: { '(document:keydown.escape)': 'alPresionarEscape()' },
  template: `
    @if (abierto()) {
      <div class="modal-backdrop fade show"></div>
      <div
        class="modal fade show d-block"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialogo-titulo"
        (click)="alHacerClicFuera($event)"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-body p-4 text-center">
              <div
                class="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center fs-3"
                style="width: 64px; height: 64px"
                [class]="'bg-' + color() + '-subtle text-' + color()"
              >
                <i class="bi" [class]="icono()"></i>
              </div>
              <h2 id="dialogo-titulo" class="h5 fw-bold">{{ titulo() }}</h2>
              <p class="text-body-secondary mb-0">{{ mensaje() }}</p>
            </div>
            <div class="modal-footer border-0 justify-content-center pt-0 pb-4">
              <button type="button" class="btn btn-light px-4" [disabled]="procesando()" (click)="cancelar.emit()">
                Cancelar
              </button>
              <button
                type="button"
                class="btn px-4"
                [class]="'btn-' + color()"
                [disabled]="procesando()"
                (click)="confirmar.emit()"
              >
                @if (procesando()) {
                  <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                }
                {{ textoConfirmar() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class DialogoConfirmacion {
  readonly abierto = input(false);
  readonly titulo = input('¿Estás seguro?');
  readonly mensaje = input('');
  readonly textoConfirmar = input('Eliminar');
  readonly color = input('danger');
  readonly icono = input('bi-trash3');
  readonly procesando = input(false);

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  alHacerClicFuera(evento: MouseEvent) {
    if (evento.target === evento.currentTarget && !this.procesando()) {
      this.cancelar.emit();
    }
  }

  alPresionarEscape() {
    if (this.abierto() && !this.procesando()) {
      this.cancelar.emit();
    }
  }
}

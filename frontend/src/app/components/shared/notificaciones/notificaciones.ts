import { Component, inject } from '@angular/core';
import { NotificacionService, TipoNotificacion } from '../../../services/notificacion.service';

const ICONOS: Record<TipoNotificacion, string> = {
  exito: 'bi-check-circle-fill',
  error: 'bi-x-circle-fill',
  advertencia: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill',
};

@Component({
  selector: 'app-notificaciones',
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1100">
      @for (n of notificacionService.notificaciones(); track n.id) {
        <div class="toast show toast-eco shadow border-0" [class]="'toast-' + n.tipo" role="alert" aria-live="polite">
          <div class="d-flex align-items-start p-3 gap-2">
            <i class="bi fs-5" [class]="iconos[n.tipo]"></i>
            <div class="flex-grow-1">
              <strong class="d-block">{{ n.titulo }}</strong>
              <span class="small text-body-secondary">{{ n.mensaje }}</span>
            </div>
            <button type="button" class="btn-close btn-sm" aria-label="Cerrar" (click)="notificacionService.cerrar(n.id)"></button>
          </div>
        </div>
      }
    </div>
  `,
})
export class Notificaciones {
  protected readonly notificacionService = inject(NotificacionService);
  protected readonly iconos = ICONOS;
}

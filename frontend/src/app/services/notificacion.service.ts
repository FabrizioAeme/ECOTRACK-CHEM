import { Service, signal } from '@angular/core';

export type TipoNotificacion = 'exito' | 'error' | 'advertencia' | 'info';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
}

@Service()
export class NotificacionService {
  private siguienteId = 1;
  readonly notificaciones = signal<Notificacion[]>([]);

  exito(mensaje: string, titulo = 'Operación exitosa') {
    this.mostrar('exito', titulo, mensaje);
  }

  error(mensaje: string, titulo = 'Ocurrió un error') {
    this.mostrar('error', titulo, mensaje, 7000);
  }

  advertencia(mensaje: string, titulo = 'Atención') {
    this.mostrar('advertencia', titulo, mensaje, 6000);
  }

  info(mensaje: string, titulo = 'Información') {
    this.mostrar('info', titulo, mensaje);
  }

  pendiente(accion: string) {
    this.info(`${accion} se conectará con el backend en la siguiente entrega.`, 'Vista de diseño');
  }

  cerrar(id: number) {
    this.notificaciones.update((lista) => lista.filter((n) => n.id !== id));
  }

  private mostrar(tipo: TipoNotificacion, titulo: string, mensaje: string, duracionMs = 4500) {
    const id = this.siguienteId++;
    this.notificaciones.update((lista) => [...lista, { id, tipo, titulo, mensaje }]);
    setTimeout(() => this.cerrar(id), duracionMs);
  }
}

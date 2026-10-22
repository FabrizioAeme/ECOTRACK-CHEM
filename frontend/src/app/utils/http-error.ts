import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api-error.interface';

export function obtenerMensajeError(
  error: unknown,
  porDefecto = 'Ocurrió un error inesperado. Inténtalo nuevamente.',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return porDefecto;
  }
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.';
  }

  const cuerpo = error.error as Partial<ApiError> | null;
  if (cuerpo?.details && error.status === 400) {
    const detalle = Object.entries(cuerpo.details)
      .map(([campo, mensaje]) => `${campo}: ${mensaje}`)
      .join(' · ');
    return `${cuerpo.error ?? 'Datos inválidos'}. ${detalle}`;
  }
  if (cuerpo?.error) {
    return cuerpo.error;
  }

  return error.status >= 500 ? 'Error interno del servidor. Inténtalo más tarde.' : porDefecto;
}

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
    const detalle = Object.values(cuerpo.details).join(' · ');
    return `${cuerpo.error ?? 'Datos inválidos'}: ${detalle}`;
  }
  if (cuerpo?.error) {
    return cuerpo.error;
  }

  switch (error.status) {
    case 401:
      return 'Tu sesión no es válida. Inicia sesión nuevamente.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El registro solicitado no existe.';
    case 409:
      return 'La operación entra en conflicto con datos existentes.';
    default:
      return error.status >= 500 ? 'Error interno del servidor. Inténtalo más tarde.' : porDefecto;
  }
}

export function erroresPorCampo(error: unknown): Record<string, string> {
  if (error instanceof HttpErrorResponse && error.status === 400) {
    return (error.error as Partial<ApiError> | null)?.details ?? {};
  }
  return {};
}

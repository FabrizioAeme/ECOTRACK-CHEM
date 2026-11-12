import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EstadoLote, ESTADOS_LOTE, Lote } from '../../../models/lote.interface';
import { AuthService } from '../../../services/auth.service';
import { LoteService } from '../../../services/lote.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { obtenerMensajeError } from '../../../utils/http-error';
import { ListadoPaginado } from '../../../utils/listado-paginado';
import { BarraBusqueda } from '../../shared/barra-busqueda/barra-busqueda';
import { DialogoConfirmacion } from '../../shared/dialogo-confirmacion/dialogo-confirmacion';
import { EncabezadoPagina } from '../../shared/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../shared/estado-vacio/estado-vacio';
import { IndicadorCarga } from '../../shared/indicador-carga/indicador-carga';
import { Insignia } from '../../shared/insignia/insignia';
import { Paginacion } from '../../shared/paginacion/paginacion';

@Component({
  selector: 'app-lote-list',
  imports: [
    RouterLink,
    FormsModule,
    DatePipe,
    DecimalPipe,
    EncabezadoPagina,
    BarraBusqueda,
    EstadoVacio,
    Insignia,
    DialogoConfirmacion,
    IndicadorCarga,
    Paginacion,
  ],
  templateUrl: './lote-list.html',
})
export class LoteList {
  private loteService = inject(LoteService);
  private notificacion = inject(NotificacionService);
  readonly esAdministrador = inject(AuthService).esAdministrador;

  readonly estados = ESTADOS_LOTE;

  readonly listado = new ListadoPaginado<Lote, EstadoLote>(
    (consulta) => this.loteService.listarPaginado(consulta),
    { ordenarPor: 'fechaFabricacion', direccion: 'desc' },
  );

  readonly loteAEliminar = signal<Lote | null>(null);
  readonly eliminando = signal(false);

  confirmarEliminacion() {
    const lote = this.loteAEliminar();
    if (!lote) {
      return;
    }
    this.eliminando.set(true);
    this.loteService.eliminar(lote.id).subscribe({
      next: () => {
        this.notificacion.exito(`Se eliminó el lote ${lote.codigoLote}.`);
        this.eliminando.set(false);
        this.cerrarDialogo();
        this.listado.recargar();
      },
      error: (err) => {
        this.eliminando.set(false);
        this.cerrarDialogo();
        this.notificacion.error(obtenerMensajeError(err), 'No se pudo eliminar');
      },
    });
  }

  cerrarDialogo() {
    this.loteAEliminar.set(null);
  }
}

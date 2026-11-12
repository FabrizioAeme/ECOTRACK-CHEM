import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InsumoQuimico, NivelPeligrosidad, NIVELES_PELIGROSIDAD } from '../../../models/insumo.interface';
import { AuthService } from '../../../services/auth.service';
import { InsumoService } from '../../../services/insumo.service';
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
  selector: 'app-insumo-list',
  imports: [
    RouterLink,
    FormsModule,
    DecimalPipe,
    EncabezadoPagina,
    BarraBusqueda,
    EstadoVacio,
    Insignia,
    DialogoConfirmacion,
    IndicadorCarga,
    Paginacion,
  ],
  templateUrl: './insumo-list.html',
})
export class InsumoList {
  private insumoService = inject(InsumoService);
  private notificacion = inject(NotificacionService);
  readonly esAdministrador = inject(AuthService).esAdministrador;

  readonly niveles = NIVELES_PELIGROSIDAD;

  readonly listado = new ListadoPaginado<InsumoQuimico, NivelPeligrosidad>(
    (consulta) => this.insumoService.listarPaginado(consulta),
    { ordenarPor: 'nombre', direccion: 'asc' },
  );

  readonly insumoAEliminar = signal<InsumoQuimico | null>(null);
  readonly eliminando = signal(false);

  confirmarEliminacion() {
    const insumo = this.insumoAEliminar();
    if (!insumo) {
      return;
    }
    this.eliminando.set(true);
    this.insumoService.eliminar(insumo.id).subscribe({
      next: () => {
        this.notificacion.exito(`Se eliminó el insumo «${insumo.nombre}».`);
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
    this.insumoAEliminar.set(null);
  }
}

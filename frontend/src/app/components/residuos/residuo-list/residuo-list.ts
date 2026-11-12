import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DisposicionFinal, DISPOSICIONES_FINALES, ResiduoIndustrial } from '../../../models/residuo.interface';
import { AuthService } from '../../../services/auth.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { ResiduoService } from '../../../services/residuo.service';
import { obtenerMensajeError } from '../../../utils/http-error';
import { ListadoPaginado } from '../../../utils/listado-paginado';
import { pluralizar } from '../../../utils/texto';
import { BarraBusqueda } from '../../shared/barra-busqueda/barra-busqueda';
import { DialogoConfirmacion } from '../../shared/dialogo-confirmacion/dialogo-confirmacion';
import { EncabezadoPagina } from '../../shared/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../shared/estado-vacio/estado-vacio';
import { IndicadorCarga } from '../../shared/indicador-carga/indicador-carga';
import { Insignia } from '../../shared/insignia/insignia';
import { Paginacion } from '../../shared/paginacion/paginacion';

@Component({
  selector: 'app-residuo-list',
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
  templateUrl: './residuo-list.html',
})
export class ResiduoList {
  private residuoService = inject(ResiduoService);
  private notificacion = inject(NotificacionService);
  readonly esAdministrador = inject(AuthService).esAdministrador;

  readonly disposiciones = DISPOSICIONES_FINALES;
  readonly pluralizar = pluralizar;

  readonly listado = new ListadoPaginado<ResiduoIndustrial, DisposicionFinal>(
    (consulta) => this.residuoService.listarPaginado(consulta),
    { ordenarPor: 'id', direccion: 'desc' },
  );

  readonly volumenPagina = computed(() =>
    this.listado.elementos().reduce((total, r) => total + Number(r.volumenLitros), 0),
  );

  readonly residuoAEliminar = signal<ResiduoIndustrial | null>(null);
  readonly eliminando = signal(false);

  confirmarEliminacion() {
    const residuo = this.residuoAEliminar();
    if (!residuo) {
      return;
    }
    this.eliminando.set(true);
    this.residuoService.eliminar(residuo.id).subscribe({
      next: () => {
        this.notificacion.exito(`Se eliminó el residuo «${residuo.tipoResiduo}».`);
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
    this.residuoAEliminar.set(null);
  }
}

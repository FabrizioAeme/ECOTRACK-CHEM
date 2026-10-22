import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { INSUMOS_EJEMPLO } from '../../../data/datos-ejemplo';
import { InsumoQuimico, NivelPeligrosidad, NIVELES_PELIGROSIDAD } from '../../../models/insumo.interface';
import { NotificacionService } from '../../../services/notificacion.service';
import { normalizarTexto } from '../../../utils/texto';
import { AvisoDiseno } from '../../shared/aviso-diseno/aviso-diseno';
import { BarraBusqueda } from '../../shared/barra-busqueda/barra-busqueda';
import { DialogoConfirmacion } from '../../shared/dialogo-confirmacion/dialogo-confirmacion';
import { EncabezadoPagina } from '../../shared/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../shared/estado-vacio/estado-vacio';
import { Insignia } from '../../shared/insignia/insignia';

@Component({
  selector: 'app-insumo-list',
  imports: [
    RouterLink,
    FormsModule,
    DecimalPipe,
    EncabezadoPagina,
    AvisoDiseno,
    BarraBusqueda,
    EstadoVacio,
    Insignia,
    DialogoConfirmacion,
  ],
  templateUrl: './insumo-list.html',
})
export class InsumoList {
  private notificacion = inject(NotificacionService);

  readonly niveles = NIVELES_PELIGROSIDAD;

  readonly insumos = signal<InsumoQuimico[]>(INSUMOS_EJEMPLO);

  readonly busqueda = signal('');
  readonly filtroPeligrosidad = signal<NivelPeligrosidad | ''>('');

  readonly insumoAEliminar = signal<InsumoQuimico | null>(null);

  readonly insumosFiltrados = computed(() => {
    const texto = normalizarTexto(this.busqueda());
    const nivel = this.filtroPeligrosidad();
    return this.insumos().filter(
      (i) =>
        (!nivel || i.nivelPeligrosidad === nivel) &&
        (!texto || normalizarTexto(i.nombre).includes(texto) || i.codigoCas.includes(texto)),
    );
  });

  limpiarFiltros() {
    this.busqueda.set('');
    this.filtroPeligrosidad.set('');
  }

  confirmarEliminacion() {
    this.notificacion.pendiente('La eliminación de insumos');
    this.cerrarDialogo();
  }

  cerrarDialogo() {
    this.insumoAEliminar.set(null);
  }
}

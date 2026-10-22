import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LOTES_EJEMPLO } from '../../../data/datos-ejemplo';
import { EstadoLote, ESTADOS_LOTE, Lote } from '../../../models/lote.interface';
import { NotificacionService } from '../../../services/notificacion.service';
import { normalizarTexto } from '../../../utils/texto';
import { AvisoDiseno } from '../../shared/aviso-diseno/aviso-diseno';
import { BarraBusqueda } from '../../shared/barra-busqueda/barra-busqueda';
import { DialogoConfirmacion } from '../../shared/dialogo-confirmacion/dialogo-confirmacion';
import { EncabezadoPagina } from '../../shared/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../shared/estado-vacio/estado-vacio';
import { Insignia } from '../../shared/insignia/insignia';

@Component({
  selector: 'app-lote-list',
  imports: [
    RouterLink,
    FormsModule,
    DatePipe,
    DecimalPipe,
    EncabezadoPagina,
    AvisoDiseno,
    BarraBusqueda,
    EstadoVacio,
    Insignia,
    DialogoConfirmacion,
  ],
  templateUrl: './lote-list.html',
})
export class LoteList {
  private notificacion = inject(NotificacionService);

  readonly estados = ESTADOS_LOTE;

  readonly lotes = signal<Lote[]>(LOTES_EJEMPLO);

  readonly busqueda = signal('');
  readonly filtroEstado = signal<EstadoLote | ''>('');

  readonly loteAEliminar = signal<Lote | null>(null);

  readonly lotesFiltrados = computed(() => {
    const texto = normalizarTexto(this.busqueda());
    const estado = this.filtroEstado();
    return this.lotes()
      .filter(
        (l) =>
          (!estado || l.estado === estado) &&
          (!texto ||
            normalizarTexto(l.codigoLote).includes(texto) ||
            normalizarTexto(l.insumoNombre).includes(texto) ||
            normalizarTexto(l.usuarioNombre).includes(texto)),
      )
      .sort((a, b) => b.fechaFabricacion.localeCompare(a.fechaFabricacion) || b.id - a.id);
  });

  limpiarFiltros() {
    this.busqueda.set('');
    this.filtroEstado.set('');
  }

  confirmarEliminacion() {
    this.notificacion.pendiente('La eliminación de lotes');
    this.cerrarDialogo();
  }

  cerrarDialogo() {
    this.loteAEliminar.set(null);
  }
}

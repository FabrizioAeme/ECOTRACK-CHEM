import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RESIDUOS_EJEMPLO } from '../../../data/datos-ejemplo';
import {
  DisposicionFinal,
  DISPOSICIONES_FINALES,
  ResiduoIndustrial,
} from '../../../models/residuo.interface';
import { NotificacionService } from '../../../services/notificacion.service';
import { normalizarTexto, pluralizar } from '../../../utils/texto';
import { AvisoDiseno } from '../../shared/aviso-diseno/aviso-diseno';
import { BarraBusqueda } from '../../shared/barra-busqueda/barra-busqueda';
import { DialogoConfirmacion } from '../../shared/dialogo-confirmacion/dialogo-confirmacion';
import { EncabezadoPagina } from '../../shared/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../shared/estado-vacio/estado-vacio';
import { Insignia } from '../../shared/insignia/insignia';

@Component({
  selector: 'app-residuo-list',
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
  templateUrl: './residuo-list.html',
})
export class ResiduoList {
  private notificacion = inject(NotificacionService);

  readonly disposiciones = DISPOSICIONES_FINALES;
  readonly pluralizar = pluralizar;

  readonly residuos = signal<ResiduoIndustrial[]>(RESIDUOS_EJEMPLO);

  readonly busqueda = signal('');
  readonly filtroDisposicion = signal<DisposicionFinal | ''>('');

  readonly residuoAEliminar = signal<ResiduoIndustrial | null>(null);

  readonly residuosFiltrados = computed(() => {
    const texto = normalizarTexto(this.busqueda());
    const disposicion = this.filtroDisposicion();
    return this.residuos().filter(
      (r) =>
        (!disposicion || r.disposicionFinal === disposicion) &&
        (!texto ||
          normalizarTexto(r.tipoResiduo).includes(texto) ||
          normalizarTexto(r.loteCodigo).includes(texto)),
    );
  });

  readonly volumenFiltrado = computed(() =>
    this.residuosFiltrados().reduce((total, r) => total + Number(r.volumenLitros), 0),
  );

  limpiarFiltros() {
    this.busqueda.set('');
    this.filtroDisposicion.set('');
  }

  confirmarEliminacion() {
    this.notificacion.pendiente('La eliminación de residuos');
    this.cerrarDialogo();
  }

  cerrarDialogo() {
    this.residuoAEliminar.set(null);
  }
}

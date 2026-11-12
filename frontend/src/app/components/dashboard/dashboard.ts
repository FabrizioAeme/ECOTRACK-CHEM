import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { InsumoQuimico, NIVELES_PELIGROSIDAD } from '../../models/insumo.interface';
import { ESTADOS_LOTE, Lote } from '../../models/lote.interface';
import { DISPOSICIONES_FINALES, ResiduoIndustrial } from '../../models/residuo.interface';
import { AuthService } from '../../services/auth.service';
import { InsumoService } from '../../services/insumo.service';
import { LoteService } from '../../services/lote.service';
import { ResiduoService } from '../../services/residuo.service';
import { obtenerMensajeError } from '../../utils/http-error';
import { pluralizar } from '../../utils/texto';
import { EstadoVacio } from '../shared/estado-vacio/estado-vacio';
import { IndicadorCarga } from '../shared/indicador-carga/indicador-carga';
import { EncabezadoPagina } from '../shared/encabezado-pagina/encabezado-pagina';
import { Insignia } from '../shared/insignia/insignia';
import { TarjetaIndicador } from '../shared/tarjeta-indicador/tarjeta-indicador';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, DecimalPipe, EncabezadoPagina, Insignia, TarjetaIndicador, IndicadorCarga, EstadoVacio],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private insumoService = inject(InsumoService);
  private loteService = inject(LoteService);
  private residuoService = inject(ResiduoService);
  readonly nombreUsuario = inject(AuthService).nombreUsuario;

  readonly estadosLote = ESTADOS_LOTE;
  readonly pluralizar = pluralizar;

  readonly insumos = signal<InsumoQuimico[]>([]);
  readonly lotes = signal<Lote[]>([]);
  readonly residuos = signal<ResiduoIndustrial[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');
    forkJoin({
      insumos: this.insumoService.listar(),
      lotes: this.loteService.listar(),
      residuos: this.residuoService.listar(),
    }).subscribe({
      next: ({ insumos, lotes, residuos }) => {
        this.insumos.set(insumos);
        this.lotes.set(lotes);
        this.residuos.set(residuos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(obtenerMensajeError(err, 'No se pudo cargar el resumen.'));
        this.cargando.set(false);
      },
    });
  }

  readonly insumosPeligrosos = computed(
    () => this.insumos().filter((i) => i.nivelPeligrosidad !== 'NEUTRO').length,
  );
  readonly lotesEnProceso = computed(
    () => this.lotes().filter((l) => l.estado === 'EN_PROCESO').length,
  );
  readonly volumenResiduos = computed(() =>
    this.residuos().reduce((total, r) => total + Number(r.volumenLitros), 0),
  );
  readonly residuosConCertificado = computed(
    () => this.residuos().filter((r) => r.requiereCertificado).length,
  );

  readonly ultimosLotes = computed(() =>
    [...this.lotes()]
      .sort((a, b) => b.fechaFabricacion.localeCompare(a.fechaFabricacion) || b.id - a.id)
      .slice(0, 5),
  );

  readonly porDisposicion = computed(() => {
    const total = this.volumenResiduos();
    return DISPOSICIONES_FINALES.map((opcion) => {
      const volumen = this.residuos()
        .filter((r) => r.disposicionFinal === opcion.valor)
        .reduce((suma, r) => suma + Number(r.volumenLitros), 0);
      return { opcion, volumen, porcentaje: total ? (volumen * 100) / total : 0 };
    });
  });

  readonly porcentajeCircular = computed(
    () => this.porDisposicion().find((d) => d.opcion.valor === 'RECICLADO_REUSO')?.porcentaje ?? 0,
  );

  readonly porPeligrosidad = computed(() => {
    const total = this.insumos().length;
    return NIVELES_PELIGROSIDAD.map((opcion) => {
      const cantidad = this.insumos().filter((i) => i.nivelPeligrosidad === opcion.valor).length;
      return { opcion, cantidad, porcentaje: total ? (cantidad * 100) / total : 0 };
    });
  });
}

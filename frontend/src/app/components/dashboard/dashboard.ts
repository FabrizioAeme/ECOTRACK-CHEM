import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { INSUMOS_EJEMPLO, LOTES_EJEMPLO, RESIDUOS_EJEMPLO } from '../../data/datos-ejemplo';
import { InsumoQuimico, NIVELES_PELIGROSIDAD } from '../../models/insumo.interface';
import { ESTADOS_LOTE, Lote } from '../../models/lote.interface';
import { DISPOSICIONES_FINALES, ResiduoIndustrial } from '../../models/residuo.interface';
import { pluralizar } from '../../utils/texto';
import { AvisoDiseno } from '../shared/aviso-diseno/aviso-diseno';
import { EncabezadoPagina } from '../shared/encabezado-pagina/encabezado-pagina';
import { Insignia } from '../shared/insignia/insignia';
import { TarjetaIndicador } from '../shared/tarjeta-indicador/tarjeta-indicador';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, DecimalPipe, EncabezadoPagina, AvisoDiseno, Insignia, TarjetaIndicador],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  readonly estadosLote = ESTADOS_LOTE;
  readonly pluralizar = pluralizar;

  readonly insumos = signal<InsumoQuimico[]>(INSUMOS_EJEMPLO);
  readonly lotes = signal<Lote[]>(LOTES_EJEMPLO);
  readonly residuos = signal<ResiduoIndustrial[]>(RESIDUOS_EJEMPLO);

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

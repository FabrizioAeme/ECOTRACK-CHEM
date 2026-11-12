import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { Lote } from '../../../models/lote.interface';
import { DisposicionFinal, DISPOSICIONES_FINALES, ResiduoIndustrialRequest } from '../../../models/residuo.interface';
import { LoteService } from '../../../services/lote.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { ResiduoService } from '../../../services/residuo.service';
import { erroresPorCampo, obtenerMensajeError } from '../../../utils/http-error';
import { mayorQueCero, soloEspacios } from '../../../utils/validadores';
import { EncabezadoPagina } from '../../shared/encabezado-pagina/encabezado-pagina';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { IndicadorCarga } from '../../shared/indicador-carga/indicador-carga';
import { SelectorCatalogo } from '../../shared/selector-catalogo/selector-catalogo';

type CampoResiduo = 'tipoResiduo' | 'volumenLitros' | 'disposicionFinal' | 'loteId';

@Component({
  selector: 'app-residuo-form',
  imports: [ReactiveFormsModule, RouterLink, EncabezadoPagina, ErrorCampo, SelectorCatalogo, IndicadorCarga],
  templateUrl: './residuo-form.html',
})
export class ResiduoForm implements OnInit {
  private fb = inject(FormBuilder);
  private residuoService = inject(ResiduoService);
  private loteService = inject(LoteService);
  private notificacion = inject(NotificacionService);
  private enrutador = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly id = input<string>();
  readonly loteId = input<string>();
  readonly esEdicion = computed(() => !!this.id());

  readonly disposiciones = DISPOSICIONES_FINALES;
  readonly tiposSugeridos = ['Solvente gastado', 'Lodo químico', 'Agua de lavado ácida', 'Envases contaminados'];
  readonly lotes = signal<Lote[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly errorServidor = signal('');
  readonly certificadoObligatorio = signal(false);

  readonly form = this.fb.group({
    tipoResiduo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100), soloEspacios]),
    volumenLitros: this.fb.control<number | null>(null, [Validators.required, mayorQueCero]),
    disposicionFinal: this.fb.control<DisposicionFinal | null>(null, Validators.required),
    requiereCertificado: this.fb.nonNullable.control(false),
    loteId: this.fb.control<number | null>(null, Validators.required),
  });

  ngOnInit() {
    this.form.controls.disposicionFinal.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((disposicion) => this.aplicarReglaCertificado(disposicion));

    const residuo$ = this.esEdicion() ? this.residuoService.obtener(Number(this.id())) : of(null);

    forkJoin({ lotes: this.loteService.listar(), residuo: residuo$ }).subscribe({
      next: ({ lotes, residuo }) => {
        this.lotes.set(lotes.filter((l) => l.estado !== 'AUDITADO'));
        if (residuo) {
          const loteDelResiduo = lotes.find((l) => l.id === residuo.loteId);
          if (loteDelResiduo?.estado === 'AUDITADO') {
            this.notificacion.advertencia(
              `El lote ${loteDelResiduo.codigoLote} ya fue auditado: sus residuos no se pueden modificar.`,
            );
            this.enrutador.navigate(['/residuos']);
            return;
          }
          this.form.patchValue(residuo);
        } else if (this.loteId()) {
          const elegido = Number(this.loteId());
          this.form.controls.loteId.setValue(this.lotes().some((l) => l.id === elegido) ? elegido : null);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        this.notificacion.error(obtenerMensajeError(err), 'No se pudo cargar el formulario');
        this.enrutador.navigate(['/residuos']);
      },
    });
  }

  invalido(campo: CampoResiduo): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificacion.advertencia('Revisa los campos marcados en rojo.', 'Formulario incompleto');
      return;
    }

    const valores = this.form.getRawValue();
    const datos: ResiduoIndustrialRequest = {
      tipoResiduo: valores.tipoResiduo.trim(),
      volumenLitros: Number(valores.volumenLitros),
      disposicionFinal: valores.disposicionFinal!,
      requiereCertificado: valores.requiereCertificado,
      loteId: valores.loteId!,
    };

    this.guardando.set(true);
    this.errorServidor.set('');
    const peticion = this.esEdicion()
      ? this.residuoService.actualizar(Number(this.id()), datos)
      : this.residuoService.crear(datos);

    peticion.subscribe({
      next: (residuo) => {
        this.notificacion.exito(
          this.esEdicion()
            ? `Se actualizó el residuo «${residuo.tipoResiduo}».`
            : `Se registró el residuo «${residuo.tipoResiduo}» del lote ${residuo.loteCodigo}.`,
        );
        this.enrutador.navigate(['/residuos']);
      },
      error: (err) => {
        this.guardando.set(false);
        Object.entries(erroresPorCampo(err)).forEach(([campo, mensaje]) => {
          const control = this.form.get(campo);
          control?.setErrors({ servidor: mensaje });
          control?.markAsTouched();
        });
        this.errorServidor.set(obtenerMensajeError(err, 'No se pudo guardar el residuo.'));
      },
    });
  }

  private aplicarReglaCertificado(disposicion: DisposicionFinal | null) {
    const control = this.form.controls.requiereCertificado;
    const obligatorio = disposicion === 'RECOGIDA_ESPECIAL';
    this.certificadoObligatorio.set(obligatorio);
    if (obligatorio) {
      control.setValue(true);
      control.disable({ emitEvent: false });
    } else {
      control.enable({ emitEvent: false });
    }
  }
}

import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InsumoQuimicoRequest, NivelPeligrosidad, NIVELES_PELIGROSIDAD, PATRON_CAS } from '../../../models/insumo.interface';
import { InsumoService } from '../../../services/insumo.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { erroresPorCampo, obtenerMensajeError } from '../../../utils/http-error';
import { mayorQueCero, soloEspacios } from '../../../utils/validadores';
import { EncabezadoPagina } from '../../shared/encabezado-pagina/encabezado-pagina';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { IndicadorCarga } from '../../shared/indicador-carga/indicador-carga';
import { Insignia } from '../../shared/insignia/insignia';
import { SelectorCatalogo } from '../../shared/selector-catalogo/selector-catalogo';

type CampoInsumo = 'codigoCas' | 'nombre' | 'nivelPureza' | 'nivelPeligrosidad' | 'stockDisponible';

@Component({
  selector: 'app-insumo-form',
  imports: [ReactiveFormsModule, RouterLink, EncabezadoPagina, ErrorCampo, Insignia, SelectorCatalogo, IndicadorCarga],
  templateUrl: './insumo-form.html',
})
export class InsumoForm implements OnInit {
  private fb = inject(FormBuilder);
  private insumoService = inject(InsumoService);
  private notificacion = inject(NotificacionService);
  private enrutador = inject(Router);

  readonly id = input<string>();
  readonly esEdicion = computed(() => !!this.id());

  readonly niveles = NIVELES_PELIGROSIDAD;
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly errorServidor = signal('');

  readonly form = this.fb.group({
    codigoCas: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(PATRON_CAS)]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150), soloEspacios]),
    nivelPureza: this.fb.control<number | null>(null, [Validators.required, mayorQueCero, Validators.max(100)]),
    nivelPeligrosidad: this.fb.control<NivelPeligrosidad | null>(null, Validators.required),
    stockDisponible: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  ngOnInit() {
    if (!this.esEdicion()) {
      return;
    }
    this.cargando.set(true);
    this.insumoService.obtener(Number(this.id())).subscribe({
      next: (insumo) => {
        this.form.patchValue(insumo);
        this.cargando.set(false);
      },
      error: (err) => {
        this.notificacion.error(obtenerMensajeError(err), 'No se pudo cargar el insumo');
        this.enrutador.navigate(['/insumos']);
      },
    });
  }

  invalido(campo: CampoInsumo): boolean {
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
    const datos: InsumoQuimicoRequest = {
      codigoCas: valores.codigoCas.trim(),
      nombre: valores.nombre.trim(),
      nivelPureza: Number(valores.nivelPureza),
      nivelPeligrosidad: valores.nivelPeligrosidad!,
      stockDisponible: Number(valores.stockDisponible),
    };

    this.guardando.set(true);
    this.errorServidor.set('');
    const peticion = this.esEdicion()
      ? this.insumoService.actualizar(Number(this.id()), datos)
      : this.insumoService.crear(datos);

    peticion.subscribe({
      next: (insumo) => {
        this.notificacion.exito(
          this.esEdicion() ? `Se actualizó «${insumo.nombre}».` : `Se registró «${insumo.nombre}».`,
        );
        this.enrutador.navigate(['/insumos']);
      },
      error: (err) => {
        this.guardando.set(false);
        this.marcarErroresDelServidor(err);
        this.errorServidor.set(obtenerMensajeError(err, 'No se pudo guardar el insumo.'));
      },
    });
  }

  private marcarErroresDelServidor(err: unknown) {
    Object.entries(erroresPorCampo(err)).forEach(([campo, mensaje]) => {
      const control = this.form.get(campo);
      control?.setErrors({ servidor: mensaje });
      control?.markAsTouched();
    });
  }
}

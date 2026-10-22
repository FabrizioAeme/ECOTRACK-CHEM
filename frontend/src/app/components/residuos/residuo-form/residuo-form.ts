import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LOTES_EJEMPLO, RESIDUOS_EJEMPLO } from '../../../data/datos-ejemplo';
import { Lote } from '../../../models/lote.interface';
import { DisposicionFinal, DISPOSICIONES_FINALES } from '../../../models/residuo.interface';
import { NotificacionService } from '../../../services/notificacion.service';
import { mayorQueCero, soloEspacios } from '../../../utils/validadores';
import { AvisoDiseno } from '../../shared/aviso-diseno/aviso-diseno';
import { EncabezadoPagina } from '../../shared/encabezado-pagina/encabezado-pagina';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { SelectorCatalogo } from '../../shared/selector-catalogo/selector-catalogo';

type CampoResiduo = 'tipoResiduo' | 'volumenLitros' | 'disposicionFinal' | 'loteId';

@Component({
  selector: 'app-residuo-form',
  imports: [ReactiveFormsModule, RouterLink, EncabezadoPagina, AvisoDiseno, ErrorCampo, SelectorCatalogo],
  templateUrl: './residuo-form.html',
})
export class ResiduoForm implements OnInit {
  private fb = inject(FormBuilder);
  private notificacion = inject(NotificacionService);

  readonly id = input<string>();
  readonly loteId = input<string>();
  readonly esEdicion = computed(() => !!this.id());

  readonly disposiciones = DISPOSICIONES_FINALES;
  readonly tiposSugeridos = ['Solvente gastado', 'Lodo químico', 'Agua de lavado ácida', 'Envases contaminados'];
  readonly lotes = signal<Lote[]>(LOTES_EJEMPLO);

  readonly form = this.fb.group({
    tipoResiduo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100), soloEspacios]),
    volumenLitros: this.fb.control<number | null>(null, [Validators.required, mayorQueCero]),
    disposicionFinal: this.fb.control<DisposicionFinal | null>(null, Validators.required),
    requiereCertificado: this.fb.nonNullable.control(false),
    loteId: this.fb.control<number | null>(null, Validators.required),
  });

  ngOnInit() {
    const residuo = RESIDUOS_EJEMPLO.find((r) => r.id === Number(this.id()));
    if (residuo) {
      this.form.patchValue(residuo);
    } else if (this.loteId()) {
      this.form.controls.loteId.setValue(Number(this.loteId()));
    }
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
    this.notificacion.pendiente(this.esEdicion() ? 'La actualización de residuos' : 'El registro de residuos');
  }
}

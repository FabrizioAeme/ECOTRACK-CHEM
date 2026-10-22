import { Component, computed, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { INSUMOS_EJEMPLO } from '../../../data/datos-ejemplo';
import { NivelPeligrosidad, NIVELES_PELIGROSIDAD, PATRON_CAS } from '../../../models/insumo.interface';
import { NotificacionService } from '../../../services/notificacion.service';
import { soloEspacios } from '../../../utils/validadores';
import { AvisoDiseno } from '../../shared/aviso-diseno/aviso-diseno';
import { EncabezadoPagina } from '../../shared/encabezado-pagina/encabezado-pagina';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { Insignia } from '../../shared/insignia/insignia';
import { SelectorCatalogo } from '../../shared/selector-catalogo/selector-catalogo';

type CampoInsumo = 'codigoCas' | 'nombre' | 'nivelPureza' | 'nivelPeligrosidad' | 'stockDisponible';

@Component({
  selector: 'app-insumo-form',
  imports: [ReactiveFormsModule, RouterLink, EncabezadoPagina, AvisoDiseno, ErrorCampo, Insignia, SelectorCatalogo],
  templateUrl: './insumo-form.html',
})
export class InsumoForm implements OnInit {
  private fb = inject(FormBuilder);
  private notificacion = inject(NotificacionService);

  readonly id = input<string>();
  readonly esEdicion = computed(() => !!this.id());

  readonly niveles = NIVELES_PELIGROSIDAD;

  readonly form = this.fb.group({
    codigoCas: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(PATRON_CAS)]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150), soloEspacios]),
    nivelPureza: this.fb.control<number | null>(null, [Validators.required, Validators.min(0), Validators.max(100)]),
    nivelPeligrosidad: this.fb.control<NivelPeligrosidad | null>(null, Validators.required),
    stockDisponible: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  ngOnInit() {
    const insumo = INSUMOS_EJEMPLO.find((i) => i.id === Number(this.id()));
    if (insumo) {
      this.form.patchValue(insumo);
    }
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
    this.notificacion.pendiente(this.esEdicion() ? 'La actualización de insumos' : 'El registro de insumos');
  }
}

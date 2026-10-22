import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { INSUMOS_EJEMPLO, LOTES_EJEMPLO, USUARIOS_EJEMPLO } from '../../../data/datos-ejemplo';
import { InsumoQuimico } from '../../../models/insumo.interface';
import { EstadoLote, ESTADOS_LOTE } from '../../../models/lote.interface';
import { Usuario } from '../../../models/usuario.interface';
import { AuthService } from '../../../services/auth.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { fechaHoyISO, fechaNoFutura, mayorQueCero, soloEspacios } from '../../../utils/validadores';
import { AvisoDiseno } from '../../shared/aviso-diseno/aviso-diseno';
import { EncabezadoPagina } from '../../shared/encabezado-pagina/encabezado-pagina';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { SelectorCatalogo } from '../../shared/selector-catalogo/selector-catalogo';

type CampoLote = 'codigoLote' | 'fechaFabricacion' | 'volumenProducido' | 'estado' | 'insumoId' | 'usuarioId';

@Component({
  selector: 'app-lote-form',
  imports: [ReactiveFormsModule, RouterLink, EncabezadoPagina, AvisoDiseno, ErrorCampo, SelectorCatalogo],
  templateUrl: './lote-form.html',
})
export class LoteForm implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificacion = inject(NotificacionService);

  readonly id = input<string>();
  readonly esEdicion = computed(() => !!this.id());

  readonly estados = ESTADOS_LOTE;
  readonly hoy = fechaHoyISO();
  readonly insumos = signal<InsumoQuimico[]>(INSUMOS_EJEMPLO);
  readonly usuarios = signal<Usuario[]>(USUARIOS_EJEMPLO);

  readonly form = this.fb.group({
    codigoLote: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(30), soloEspacios]),
    fechaFabricacion: this.fb.nonNullable.control(fechaHoyISO(), [Validators.required, fechaNoFutura]),
    volumenProducido: this.fb.control<number | null>(null, [Validators.required, mayorQueCero]),
    estado: this.fb.control<EstadoLote | null>('EN_PROCESO', Validators.required),
    insumoId: this.fb.control<number | null>(null, Validators.required),
    usuarioId: this.fb.control<number | null>(null, Validators.required),
  });

  ngOnInit() {
    const lote = LOTES_EJEMPLO.find((l) => l.id === Number(this.id()));
    if (lote) {
      this.form.patchValue(lote);
      return;
    }
    const actual = this.usuarios().find((u) => u.correo === this.authService.correoUsuario());
    this.form.controls.usuarioId.setValue(actual?.id ?? null);
  }

  invalido(campo: CampoLote): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificacion.advertencia('Revisa los campos marcados en rojo.', 'Formulario incompleto');
      return;
    }
    this.notificacion.pendiente(this.esEdicion() ? 'La actualización de lotes' : 'El registro de lotes');
  }
}

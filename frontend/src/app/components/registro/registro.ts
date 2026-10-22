import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificacionService } from '../../services/notificacion.service';
import { coincideCon, soloEspacios } from '../../utils/validadores';
import { AvisoDiseno } from '../shared/aviso-diseno/aviso-diseno';
import { ErrorCampo } from '../shared/error-campo/error-campo';
import { PanelAuth } from '../shared/panel-auth/panel-auth';

type CampoRegistro = 'nombres' | 'apellidos' | 'correo' | 'clave' | 'confirmarClave';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, PanelAuth, ErrorCampo, AvisoDiseno],
  templateUrl: './registro.html',
})
export class Registro implements OnInit {
  private fb = inject(FormBuilder);
  private notificacion = inject(NotificacionService);
  private destroyRef = inject(DestroyRef);

  readonly form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.maxLength(100), soloEspacios]],
    apellidos: ['', [Validators.required, Validators.maxLength(100), soloEspacios]],
    correo: ['', [Validators.required, Validators.email]],
    clave: ['', [Validators.required, Validators.minLength(6)]],
    confirmarClave: ['', [Validators.required, coincideCon('clave')]],
  });

  readonly mostrarClave = signal(false);

  ngOnInit() {
    this.form.controls.clave.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.form.controls.confirmarClave.updateValueAndValidity());
  }

  invalido(campo: CampoRegistro): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  registrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.notificacion.pendiente('La creación de cuentas');
  }
}

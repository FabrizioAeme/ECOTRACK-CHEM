import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { erroresPorCampo, obtenerMensajeError } from '../../utils/http-error';
import { claveSegura, coincideCon, soloEspacios } from '../../utils/validadores';
import { ErrorCampo } from '../shared/error-campo/error-campo';
import { PanelAuth } from '../shared/panel-auth/panel-auth';

type CampoRegistro = 'nombres' | 'apellidos' | 'correo' | 'clave' | 'confirmarClave';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, PanelAuth, ErrorCampo],
  templateUrl: './registro.html',
})
export class Registro implements OnInit {
  private fb = inject(FormBuilder);
  private notificacion = inject(NotificacionService);
  private authService = inject(AuthService);
  private enrutador = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.maxLength(100), soloEspacios]],
    apellidos: ['', [Validators.required, Validators.maxLength(100), soloEspacios]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    clave: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(60), claveSegura]],
    confirmarClave: ['', [Validators.required, coincideCon('clave')]],
  });

  readonly mostrarClave = signal(false);
  readonly enviando = signal(false);
  readonly error = signal('');

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
    const { confirmarClave, ...datos } = this.form.getRawValue();
    this.enviando.set(true);
    this.error.set('');
    this.authService.registrar(datos).subscribe({
      next: (respuesta) => {
        this.notificacion.exito('Tu cuenta fue creada. Ya puedes iniciar sesión.', 'Cuenta creada');
        this.enrutador.navigate(['/login'], { queryParams: { correo: respuesta.correo } });
      },
      error: (err) => {
        this.enviando.set(false);
        Object.entries(erroresPorCampo(err)).forEach(([campo, mensaje]) => {
          const control = this.form.get(campo);
          control?.setErrors({ servidor: mensaje });
          control?.markAsTouched();
        });
        this.error.set(obtenerMensajeError(err, 'No se pudo crear la cuenta.'));
      },
    });
  }
}

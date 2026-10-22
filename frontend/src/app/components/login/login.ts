import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { obtenerMensajeError } from '../../utils/http-error';
import { ErrorCampo } from '../shared/error-campo/error-campo';
import { PanelAuth } from '../shared/panel-auth/panel-auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, PanelAuth, ErrorCampo],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private enrutador = inject(Router);
  private notificacion = inject(NotificacionService);

  readonly correo = input<string>();
  readonly returnUrl = input<string>();

  readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    clave: ['', Validators.required],
  });

  readonly cargando = signal(false);
  readonly error = signal('');
  readonly mostrarClave = signal(false);

  ngOnInit() {
    const correo = this.correo();
    if (correo) {
      this.form.controls.correo.setValue(correo);
    }
  }

  invalido(campo: 'correo' | 'clave'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  iniciarSesion() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.notificacion.exito('Bienvenido(a) a EcoTrack Chem.', 'Sesión iniciada');
        this.enrutador.navigateByUrl(this.destinoSeguro());
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(
          err.status === 401 ? 'Correo o contraseña incorrectos.' : obtenerMensajeError(err),
        );
      },
    });
  }

  private destinoSeguro(): string {
    const destino = this.returnUrl();
    return destino && destino.startsWith('/') && !destino.startsWith('//') ? destino : '/dashboard';
  }
}

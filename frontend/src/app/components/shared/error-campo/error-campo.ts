import { Component, computed, effect, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-error-campo',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  template: `
    @if (mensaje(); as texto) {
      <div class="invalid-feedback d-block">
        <i class="bi bi-exclamation-circle me-1"></i>{{ texto }}
      </div>
    }
  `,
})
export class ErrorCampo {
  readonly control = input.required<AbstractControl>();
  readonly mensajes = input<Record<string, string>>({});

  private readonly cambios = signal(0);

  constructor() {
    effect((onCleanup) => {
      const suscripcion = this.control().events.subscribe(() => this.cambios.update((n) => n + 1));
      onCleanup(() => suscripcion.unsubscribe());
    });
  }

  readonly mensaje = computed(() => {
    this.cambios();
    const control = this.control();
    if (!control.errors || !(control.touched || control.dirty)) {
      return null;
    }
    const [tipo, detalle] = Object.entries(control.errors)[0];
    return this.mensajes()[tipo] ?? mensajePorDefecto(tipo, detalle);
  });
}

function mensajePorDefecto(tipo: string, detalle: any): string {
  switch (tipo) {
    case 'required':
      return 'Este campo es obligatorio.';
    case 'email':
      return 'Ingresa un correo electrónico válido.';
    case 'minlength':
      return `Debe tener al menos ${detalle.requiredLength} caracteres.`;
    case 'maxlength':
      return `No debe superar los ${detalle.requiredLength} caracteres.`;
    case 'min':
      return `El valor mínimo permitido es ${detalle.min}.`;
    case 'max':
      return `El valor máximo permitido es ${detalle.max}.`;
    case 'pattern':
      return 'El formato ingresado no es válido.';
    case 'soloEspacios':
      return 'Este campo no puede contener solo espacios.';
    case 'mayorQueCero':
      return 'El valor debe ser mayor que 0.';
    case 'fechaFutura':
      return 'La fecha no puede ser posterior a hoy.';
    case 'noCoincide':
      return 'Las contraseñas no coinciden.';
    case 'servidor':
      return String(detalle);
    default:
      return 'El valor ingresado no es válido.';
  }
}

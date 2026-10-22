import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OpcionCatalogo } from '../../../models/opcion-catalogo.interface';

@Component({
  selector: 'app-selector-catalogo',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectorCatalogo), multi: true },
  ],
  templateUrl: './selector-catalogo.html',
  styleUrl: './selector-catalogo.css',
})
export class SelectorCatalogo implements ControlValueAccessor {
  readonly opciones = input.required<readonly OpcionCatalogo[]>();
  readonly etiqueta = input('');
  readonly mostrarDescripcion = input(false);

  protected readonly valor = signal<string | null>(null);
  protected readonly deshabilitado = signal(false);

  private onChange: (valor: string) => void = () => {};
  protected onTouched: () => void = () => {};

  seleccionar(valor: string) {
    this.valor.set(valor);
    this.onChange(valor);
    this.onTouched();
  }

  writeValue(valor: string | null): void {
    this.valor.set(valor);
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }
}

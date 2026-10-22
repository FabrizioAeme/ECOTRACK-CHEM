import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-barra-busqueda',
  template: `
    <div class="input-group">
      <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
      <input
        type="search"
        class="form-control border-start-0"
        [placeholder]="placeholder()"
        [attr.aria-label]="placeholder()"
        [value]="texto()"
        (input)="alEscribir($event)"
      />
    </div>
  `,
})
export class BarraBusqueda {
  readonly texto = model('');
  readonly placeholder = input('Buscar...');

  alEscribir(evento: Event) {
    this.texto.set((evento.target as HTMLInputElement).value);
  }
}

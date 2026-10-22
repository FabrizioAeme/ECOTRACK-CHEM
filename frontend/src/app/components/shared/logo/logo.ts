import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  template: `
    <span class="d-inline-flex align-items-center gap-2">
      <svg [attr.width]="tamano()" [attr.height]="tamano()" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#1f8a5b" />
        <path d="M32 10 51 21v22L32 54 13 43V21z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round" />
        <path
          d="M24 41c0-10 7-17 17-18-1 10-7 18-17 18zm0 0 9-10"
          fill="none" stroke="#bff0d6" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"
        />
      </svg>
      @if (conTexto()) {
        <span class="lh-1">
          <span class="d-block fw-bold fs-5" [class.text-white]="claro()">
            EcoTrack <span [style.color]="claro() ? '#7ee2b0' : '#1f8a5b'">Chem</span>
          </span>
          <small [class]="claro() ? 'text-white-50' : 'text-body-secondary'">Trazabilidad química</small>
        </span>
      }
    </span>
  `,
})
export class Logo {
  readonly tamano = input(36);
  readonly conTexto = input(true);
  readonly claro = input(false);
}

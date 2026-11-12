import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../shared/logo/logo';

@Component({
  selector: 'app-error404',
  imports: [RouterLink, Logo],
  template: `
    <div class="min-vh-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
      <app-logo [tamano]="40" />
      <p class="display-1 fw-bold mt-4 mb-0" style="color: var(--eco-primario)">404</p>
      <h1 class="h4 fw-bold">Página no encontrada</h1>
      <p class="text-body-secondary mb-4">La dirección que buscas no existe o fue movida.</p>
      <a routerLink="/" class="btn btn-primary"><i class="bi bi-house me-2"></i>Volver al inicio</a>
    </div>
  `,
})
export class Error404 {}

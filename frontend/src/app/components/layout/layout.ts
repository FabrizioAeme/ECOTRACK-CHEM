import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { Logo } from '../shared/logo/logo';

interface ItemMenu {
  ruta: string;
  etiqueta: string;
  icono: string;
}

interface SeccionMenu {
  titulo: string;
  items: ItemMenu[];
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe, Logo],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private authService = inject(AuthService);
  private enrutador = inject(Router);
  private notificacion = inject(NotificacionService);

  readonly correo = this.authService.correoUsuario;
  readonly inicial = computed(() => (this.correo() ?? '?').charAt(0).toUpperCase());
  readonly menuAbierto = signal(false);
  readonly hoy = new Date();

  readonly secciones: SeccionMenu[] = [
    {
      titulo: 'General',
      items: [{ ruta: '/dashboard', etiqueta: 'Panel de control', icono: 'bi-speedometer2' }],
    },
    {
      titulo: 'Trazabilidad',
      items: [
        { ruta: '/insumos', etiqueta: 'Insumos químicos', icono: 'bi-eyedropper' },
        { ruta: '/lotes', etiqueta: 'Lotes de producción', icono: 'bi-box-seam' },
        { ruta: '/residuos', etiqueta: 'Residuos industriales', icono: 'bi-recycle' },
      ],
    },
    {
      titulo: 'Administración',
      items: [{ ruta: '/usuarios', etiqueta: 'Usuarios', icono: 'bi-people' }],
    },
  ];

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.notificacion.info('Cerraste sesión correctamente.', 'Hasta pronto');
    this.enrutador.navigate(['/login']);
  }
}

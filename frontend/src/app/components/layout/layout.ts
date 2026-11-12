import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ROLES_USUARIO, RolUsuario } from '../../models/usuario.interface';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { Logo } from '../shared/logo/logo';

interface ItemMenu {
  ruta: string;
  etiqueta: string;
  icono: string;
  roles?: RolUsuario[];
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
  readonly nombre = this.authService.nombreUsuario;
  readonly inicial = computed(() => (this.nombre() || this.correo() || '?').charAt(0).toUpperCase());
  readonly etiquetaRol = computed(
    () => ROLES_USUARIO.find((r) => r.valor === this.authService.rol())?.etiqueta ?? 'Sin rol',
  );
  readonly menuAbierto = signal(false);
  readonly hoy = new Date();

  private readonly todasLasSecciones: SeccionMenu[] = [
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
      items: [{ ruta: '/usuarios', etiqueta: 'Usuarios', icono: 'bi-people', roles: ['ADMINISTRADOR'] }],
    },
  ];

  readonly secciones = computed(() => {
    this.authService.rol();
    return this.todasLasSecciones
      .map((seccion) => ({
        ...seccion,
        items: seccion.items.filter((item) => !item.roles || this.authService.tieneRol(...item.roles)),
      }))
      .filter((seccion) => seccion.items.length > 0);
  });

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.notificacion.info('Cerraste sesión correctamente.', 'Hasta pronto');
    this.enrutador.navigate(['/login']);
  }
}

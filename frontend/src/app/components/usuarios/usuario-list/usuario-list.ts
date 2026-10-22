import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { USUARIOS_EJEMPLO } from '../../../data/datos-ejemplo';
import { RolUsuario, ROLES_USUARIO, Usuario } from '../../../models/usuario.interface';
import { AuthService } from '../../../services/auth.service';
import { normalizarTexto } from '../../../utils/texto';
import { AvisoDiseno } from '../../shared/aviso-diseno/aviso-diseno';
import { BarraBusqueda } from '../../shared/barra-busqueda/barra-busqueda';
import { EncabezadoPagina } from '../../shared/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../shared/estado-vacio/estado-vacio';
import { Insignia } from '../../shared/insignia/insignia';

@Component({
  selector: 'app-usuario-list',
  imports: [FormsModule, EncabezadoPagina, AvisoDiseno, BarraBusqueda, EstadoVacio, Insignia],
  templateUrl: './usuario-list.html',
})
export class UsuarioList {
  readonly correoActual = inject(AuthService).correoUsuario;

  readonly roles = ROLES_USUARIO;

  readonly usuarios = signal<Usuario[]>(USUARIOS_EJEMPLO);

  readonly busqueda = signal('');
  readonly filtroRol = signal<RolUsuario | ''>('');

  readonly usuariosFiltrados = computed(() => {
    const texto = normalizarTexto(this.busqueda());
    const rol = this.filtroRol();
    return this.usuarios().filter(
      (u) =>
        (!rol || u.rol === rol) &&
        (!texto ||
          normalizarTexto(`${u.nombres} ${u.apellidos}`).includes(texto) ||
          normalizarTexto(u.correo).includes(texto)),
    );
  });

  iniciales(usuario: Usuario): string {
    return `${usuario.nombres.charAt(0)}${usuario.apellidos.charAt(0)}`.toUpperCase();
  }
}

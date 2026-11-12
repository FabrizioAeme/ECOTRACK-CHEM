import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RolUsuario, ROLES_USUARIO, Usuario } from '../../../models/usuario.interface';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { obtenerMensajeError } from '../../../utils/http-error';
import { normalizarTexto } from '../../../utils/texto';
import { BarraBusqueda } from '../../shared/barra-busqueda/barra-busqueda';
import { EncabezadoPagina } from '../../shared/encabezado-pagina/encabezado-pagina';
import { EstadoVacio } from '../../shared/estado-vacio/estado-vacio';
import { IndicadorCarga } from '../../shared/indicador-carga/indicador-carga';
import { Insignia } from '../../shared/insignia/insignia';

@Component({
  selector: 'app-usuario-list',
  imports: [FormsModule, EncabezadoPagina, BarraBusqueda, EstadoVacio, Insignia, IndicadorCarga],
  templateUrl: './usuario-list.html',
})
export class UsuarioList implements OnInit {
  private usuarioService = inject(UsuarioService);
  readonly correoActual = inject(AuthService).correoUsuario;

  readonly roles = ROLES_USUARIO;

  readonly usuarios = signal<Usuario[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

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

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(obtenerMensajeError(err, 'No se pudo cargar la lista de usuarios.'));
        this.cargando.set(false);
      },
    });
  }

  iniciales(usuario: Usuario): string {
    return `${usuario.nombres.charAt(0)}${usuario.apellidos.charAt(0)}`.toUpperCase();
  }
}

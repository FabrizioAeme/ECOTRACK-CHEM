import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, map, of } from 'rxjs';
import { InsumoQuimico } from '../../../models/insumo.interface';
import { EstadoLote, ESTADOS_LOTE, Lote, LoteRequest } from '../../../models/lote.interface';
import { Usuario } from '../../../models/usuario.interface';
import { AuthService } from '../../../services/auth.service';
import { InsumoService } from '../../../services/insumo.service';
import { LoteService } from '../../../services/lote.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { UsuarioService } from '../../../services/usuario.service';
import { erroresPorCampo, obtenerMensajeError } from '../../../utils/http-error';
import { fechaHoyISO, fechaNoFutura, mayorQueCero, soloEspacios } from '../../../utils/validadores';
import { EncabezadoPagina } from '../../shared/encabezado-pagina/encabezado-pagina';
import { ErrorCampo } from '../../shared/error-campo/error-campo';
import { IndicadorCarga } from '../../shared/indicador-carga/indicador-carga';
import { SelectorCatalogo } from '../../shared/selector-catalogo/selector-catalogo';

type CampoLote = 'codigoLote' | 'fechaFabricacion' | 'volumenProducido' | 'estado' | 'insumoId' | 'usuarioId';

const ORDEN_ESTADOS: EstadoLote[] = ['EN_PROCESO', 'FINALIZADO', 'AUDITADO'];

@Component({
  selector: 'app-lote-form',
  imports: [ReactiveFormsModule, RouterLink, EncabezadoPagina, ErrorCampo, SelectorCatalogo, IndicadorCarga],
  templateUrl: './lote-form.html',
})
export class LoteForm implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private loteService = inject(LoteService);
  private insumoService = inject(InsumoService);
  private usuarioService = inject(UsuarioService);
  private notificacion = inject(NotificacionService);
  private enrutador = inject(Router);

  readonly id = input<string>();
  readonly esEdicion = computed(() => !!this.id());
  readonly esAdministrador = this.authService.esAdministrador;

  readonly hoy = fechaHoyISO();
  readonly insumos = signal<InsumoQuimico[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly loteOriginal = signal<Lote | null>(null);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly errorServidor = signal('');

  readonly estadosDisponibles = computed(() => {
    const actual = this.loteOriginal()?.estado ?? 'EN_PROCESO';
    const minimo = ORDEN_ESTADOS.indexOf(actual);
    return ESTADOS_LOTE.filter((opcion) => {
      const indice = ORDEN_ESTADOS.indexOf(opcion.valor);
      if (indice < minimo) {
        return false;
      }
      if (opcion.valor === 'AUDITADO') {
        return this.esEdicion() && this.authService.puedeAuditar();
      }
      return true;
    });
  });

  readonly form = this.fb.group({
    codigoLote: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(30), soloEspacios]),
    fechaFabricacion: this.fb.nonNullable.control(fechaHoyISO(), [Validators.required, fechaNoFutura]),
    volumenProducido: this.fb.control<number | null>(null, [Validators.required, mayorQueCero]),
    estado: this.fb.control<EstadoLote | null>('EN_PROCESO', Validators.required),
    insumoId: this.fb.control<number | null>(null, Validators.required),
    usuarioId: this.fb.control<number | null>(null, Validators.required),
  });

  ngOnInit() {
    const usuarios$ = this.esAdministrador()
      ? this.usuarioService.listar()
      : this.usuarioService.perfil().pipe(map((usuario) => [usuario]));
    const lote$ = this.esEdicion() ? this.loteService.obtener(Number(this.id())) : of(null);

    forkJoin({ insumos: this.insumoService.listar(), usuarios: usuarios$, lote: lote$ }).subscribe({
      next: ({ insumos, usuarios, lote }) => {
        this.insumos.set(insumos);
        this.usuarios.set(usuarios);
        if (lote) {
          if (lote.estado === 'AUDITADO') {
            this.notificacion.advertencia(`El lote ${lote.codigoLote} ya fue auditado y no puede modificarse.`);
            this.enrutador.navigate(['/lotes']);
            return;
          }
          this.loteOriginal.set(lote);
          this.form.patchValue(lote);
        } else {
          const actual = usuarios.find((u) => u.correo === this.authService.correoUsuario());
          this.form.controls.usuarioId.setValue(actual?.id ?? null);
        }
        if (!this.esAdministrador()) {
          this.form.controls.usuarioId.disable();
        }
        this.cargando.set(false);
      },
      error: (err) => {
        this.notificacion.error(obtenerMensajeError(err), 'No se pudo cargar el formulario');
        this.enrutador.navigate(['/lotes']);
      },
    });
  }

  invalido(campo: CampoLote): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificacion.advertencia('Revisa los campos marcados en rojo.', 'Formulario incompleto');
      return;
    }

    const valores = this.form.getRawValue();
    const datos: LoteRequest = {
      codigoLote: valores.codigoLote.trim().toUpperCase(),
      fechaFabricacion: valores.fechaFabricacion,
      volumenProducido: Number(valores.volumenProducido),
      estado: valores.estado!,
      usuarioId: valores.usuarioId!,
      insumoId: valores.insumoId!,
    };

    this.guardando.set(true);
    this.errorServidor.set('');
    const peticion = this.esEdicion()
      ? this.loteService.actualizar(Number(this.id()), datos)
      : this.loteService.crear(datos);

    peticion.subscribe({
      next: (lote) => {
        this.notificacion.exito(
          this.esEdicion() ? `Se actualizó el lote ${lote.codigoLote}.` : `Se registró el lote ${lote.codigoLote}.`,
        );
        this.enrutador.navigate(['/lotes']);
      },
      error: (err) => {
        this.guardando.set(false);
        Object.entries(erroresPorCampo(err)).forEach(([campo, mensaje]) => {
          const control = this.form.get(campo);
          control?.setErrors({ servidor: mensaje });
          control?.markAsTouched();
        });
        this.errorServidor.set(obtenerMensajeError(err, 'No se pudo guardar el lote.'));
      },
    });
  }
}

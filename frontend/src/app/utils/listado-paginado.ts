import { computed, effect, signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, switchMap, tap } from 'rxjs';
import { ConsultaPaginada, PaginaResponse } from '../models/pagina.interface';
import { obtenerMensajeError } from './http-error';

export interface OpcionesListado {
  ordenarPor: string;
  direccion: 'asc' | 'desc';
  tamanio?: number;
}

export class ListadoPaginado<T, F extends string = string> {
  readonly busqueda = signal('');
  readonly filtro = signal<F | ''>('');
  readonly pagina = signal(0);
  readonly tamanio = signal(10);
  readonly resultado = signal<PaginaResponse<T> | null>(null);
  readonly cargando = signal(true);
  readonly error = signal('');

  readonly elementos = computed(() => this.resultado()?.contenido ?? []);
  readonly totalElementos = computed(() => this.resultado()?.totalElementos ?? 0);
  readonly hayFiltros = computed(() => !!this.busqueda().trim() || !!this.filtro());

  private readonly recarga = signal(0);

  constructor(
    fuente: (consulta: ConsultaPaginada) => Observable<PaginaResponse<T>>,
    private readonly opciones: OpcionesListado,
  ) {
    this.tamanio.set(opciones.tamanio ?? 10);

    const busquedaDiferida = toSignal(
      toObservable(this.busqueda).pipe(
        debounceTime(350),
        map((texto) => texto.trim()),
        distinctUntilChanged(),
      ),
      { initialValue: '' },
    );

    effect(() => {
      busquedaDiferida();
      this.filtro();
      untracked(() => this.pagina.set(0));
    });

    const consulta = computed<ConsultaPaginada & { recarga: number }>(() => ({
      buscar: busquedaDiferida(),
      filtro: this.filtro(),
      pagina: this.pagina(),
      tamanio: this.tamanio(),
      ordenarPor: this.opciones.ordenarPor,
      direccion: this.opciones.direccion,
      recarga: this.recarga(),
    }));

    toObservable(consulta)
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.error.set('');
        }),
        switchMap((c) =>
          fuente(c).pipe(
            catchError((err) => {
              this.error.set(obtenerMensajeError(err, 'No se pudo cargar el listado.'));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((respuesta) => {
        if (respuesta && respuesta.contenido.length === 0 && respuesta.pagina > 0) {
          this.pagina.set(Math.max(respuesta.totalPaginas - 1, 0));
          return;
        }
        if (respuesta) {
          this.resultado.set(respuesta);
        }
        this.cargando.set(false);
      });
  }

  irAPagina(pagina: number) {
    this.pagina.set(pagina);
  }

  cambiarTamanio(tamanio: number) {
    this.tamanio.set(tamanio);
    this.pagina.set(0);
  }

  recargar() {
    this.recarga.update((n) => n + 1);
  }

  limpiarFiltros() {
    this.busqueda.set('');
    this.filtro.set('');
  }
}

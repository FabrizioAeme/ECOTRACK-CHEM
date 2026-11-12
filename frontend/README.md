# EcoTrack Chem - Frontend

Proyecto Integrador (T3) — Interfaz web de **EcoTrack Chem**, sistema de trazabilidad química y
gestión de residuos para pymes industriales. Aporta al **ODS 9** (Industria, innovación e infraestructura).

## Alcance de esta entrega (T3)

Todas las pantallas consumen la API real del backend con JWT; ya no hay datos de ejemplo.

| Pantalla | Funcionalidad |
|---|---|
| Inicio de sesión | `POST /auth/authenticate`, guarda el JWT y lee el rol del usuario |
| Registro | `POST /auth/register` con validaciones (clave con letras y números) y mensajes del servidor |
| Cierre de sesión | Manual, automático al vencer el token y ante cualquier respuesta 401 |
| Panel de control | Indicadores calculados con los datos reales de insumos, lotes y residuos |
| Insumos / Lotes / Residuos | Listado **paginado del lado del servidor** con búsqueda, filtro, tamaño de página; registro, edición y eliminación |
| Usuarios | Solo para `ADMINISTRADOR` (protegida con `rolGuard` y por el backend) |

### Seguridad

* **Token:** se guarda en la cookie `ecotrack_jwt` con `SameSite=Strict`, `Secure` cuando la app corre en HTTPS y
  `max-age` igual al tiempo de vida del JWT. Antes de usarlo se valida su formato y su expiración; si venció,
  se borra. El *refresh token* no se guarda en el navegador.
* **Interceptores:** `authInterceptor` envía `Authorization: Bearer` solo a la API propia (nunca a `/auth/**`);
  `errorInterceptor` cierra la sesión y redirige al login ante un 401, y deja pasar el 403 para que la pantalla
  muestre "No tienes permisos".
* **Guards:** `authGuard` (rutas privadas), `invitadoGuard` (login y registro) y `rolGuard` (por rol, con
  `data: { roles: [...] }`).
* **Por rol en la interfaz:** el botón eliminar solo aparece al administrador; el estado *Auditado* solo se ofrece
  a auditores y administradores; un operador solo puede registrar lotes a su nombre; los lotes auditados se muestran
  como cerrados.

### Paginación

`ListadoPaginado` (`utils/listado-paginado.ts`) concentra el estado de cada listado: búsqueda con *debounce*
de 350 ms, filtro, página y tamaño. Cada cambio arma la consulta y llama a `listarPaginado` del servicio
(`GET /api/v1/{recurso}/paginado`); `switchMap` cancela la petición anterior si el usuario sigue escribiendo.
El componente `app-paginacion` muestra "Mostrando X–Y de Z", los números de página y el selector de tamaño.

## Tecnologías

| Herramienta | Versión |
|---|---|
| Angular (componentes standalone, signals, control flow `@if/@for`) | 22.2 |
| Bootstrap + Bootstrap Icons | 5.3 / 1.13 |
| Formularios reactivos (`ReactiveFormsModule`) | — |
| `HttpClient` con interceptores funcionales | — |
| Vitest (pruebas unitarias) | 4 |

## Requisitos

* **Node.js** 22.22+ o 24.15+ (recomendado 24 LTS) y npm.
* **Backend** de este repositorio ejecutándose en `http://localhost:8080`.
* Abrir el frontend en `http://localhost:4200` (origen permitido en `CorsConfig` del backend).

## Instalación y ejecución

```bash
cd frontend
npm install
npm start
```

Abrir `http://localhost:4200` e iniciar sesión (por ejemplo `admin@ecotrackchem.com` / `password123`).

```bash
npm run build      # compilación de producción
npm test           # pruebas unitarias
```

La URL del backend se configura en `src/environments/environment.ts`.

## Estructura

```
src/app/
├── models/          Interfaces de las entidades y catálogos de enums
├── services/        AuthService, CrudService y servicios por entidad, NotificacionService
├── interceptors/    authInterceptor (agrega el JWT) y errorInterceptor (401 / 403)
├── guards/          authGuard, invitadoGuard y rolGuard
├── utils/           Validadores, ListadoPaginado y manejo de errores HTTP
├── testing/         Utilidades para las pruebas unitarias
└── components/
    ├── shared/      Componentes reutilizables
    ├── layout/      Menú lateral + barra superior
    ├── login/  registro/  error404/  dashboard/
    ├── insumos/     insumo-list, insumo-form
    ├── lotes/       lote-list, lote-form
    ├── residuos/    residuo-list, residuo-form
    └── usuarios/    usuario-list
```

### Componentes reutilizables (`components/shared`)

| Componente | Uso |
|---|---|
| `EncabezadoPagina` | Título, subtítulo, ícono y botones de cada página |
| `DialogoConfirmacion` | Modal de confirmación antes de eliminar |
| `Notificaciones` | Mensajes emergentes (toasts) |
| `ErrorCampo` | Mensaje de validación de un campo |
| `SelectorCatalogo` | Control de formulario propio (`ControlValueAccessor`) con tarjetas seleccionables |
| `Insignia` | Etiqueta de color para peligrosidad, estado, disposición y rol |
| `BarraBusqueda` | Caja de búsqueda con enlace bidireccional (`model()`) |
| `Paginacion` | Navegación entre páginas y selector de tamaño |
| `IndicadorCarga`, `EstadoVacio`, `TarjetaIndicador`, `Logo`, `PanelAuth` | Estados de carga/vacío, indicadores y diseño del login |

# EcoTrack Chem - Frontend

Proyecto Integrador (T2) — Interfaz web de **EcoTrack Chem**, sistema de trazabilidad química y
gestión de residuos para pymes industriales. Aporta al **ODS 9** (Industria, innovación e infraestructura).

## Alcance de esta entrega

| Pantalla | Estado |
|---|---|
| Inicio de sesión | **Funcional**: se conecta al backend (`POST /auth/authenticate`), guarda el JWT y protege las rutas privadas |
| Cierre de sesión | **Funcional** |
| Registro de cuenta | Diseño (formulario con validaciones, sin conexión) |
| Panel de control | Diseño con datos de ejemplo |
| Insumos químicos | Diseño: listado, búsqueda, filtros y formulario de registro/edición |
| Lotes de producción | Diseño: listado, búsqueda, filtros y formulario de registro/edición |
| Residuos industriales | Diseño: listado, búsqueda, filtros y formulario de registro/edición |
| Usuarios | Diseño: listado con búsqueda y filtro por rol |

Las pantallas de diseño muestran datos de ejemplo (`src/app/data/datos-ejemplo.ts`). Los botones de
guardar y eliminar avisan que la conexión con el backend se implementará en la siguiente entrega.

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

Abrir `http://localhost:4200` e iniciar sesión con un usuario registrado en el backend.

```bash
npm run build      # compilación de producción
npm test           # pruebas unitarias
```

La URL del backend se configura en `src/environments/environment.ts`.

## Estructura

```
src/app/
├── models/          Interfaces de las entidades y catálogos de enums
├── data/            Datos de ejemplo para las pantallas de diseño
├── services/        AuthService (login JWT) y NotificacionService (mensajes)
├── interceptors/    authInterceptor (agrega el JWT) y errorInterceptor (sesión vencida)
├── guards/          authGuard (páginas privadas) e invitadoGuard (login/registro)
├── utils/           Validadores personalizados y utilidades
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
| `AvisoDiseno` | Aviso de pantalla en modo diseño |
| `IndicadorCarga`, `EstadoVacio`, `TarjetaIndicador`, `Logo`, `PanelAuth` | Estados de carga/vacío, indicadores y diseño del login |

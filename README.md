# EcoTrack Chem

Proyecto Integrador — Sistema de trazabilidad química y gestión de residuos para pymes industriales.
Aporta al **ODS 9** (Industria, Innovación e Infraestructura).

* **Backend:** Spring Boot 4.1, Spring Data JPA, MySQL, Spring Security con JWT y Swagger/OpenAPI (esta carpeta).
* **Frontend:** Angular 22 + Bootstrap (carpeta [`frontend/`](frontend/README.md)).

## Entrega T3 — Integración avanzada, seguridad y documentación

| # | Requerimiento | Implementación |
|---|---|---|
| 1 | Inicio de sesión con JWT | `POST /auth/authenticate` devuelve `access_token`; el token lleva `rol`, `nombre` e `id` del usuario |
| 2 | Endpoints protegidos desde Angular | `authInterceptor` agrega `Authorization: Bearer <token>` a toda llamada a `/api/v1/**` |
| 3 | Almacenamiento seguro del token | Cookie `SameSite=Strict` (y `Secure` en HTTPS) que vence junto con el JWT; antes de usarlo se validan su formato y su expiración, y se borra al vencer |
| 4 | Protección de rutas con Guards | `authGuard`, `invitadoGuard` y `rolGuard` (la sección Usuarios es solo para `ADMINISTRADOR`) |
| 5 | Cierre de sesión | Botón en la barra superior, cierre automático cuando el token expira y ante cualquier 401 |
| 6 | Paginación en módulos principales | `GET /api/v1/{insumos,lotes,residuos}/paginado` con búsqueda, filtro y orden del lado del servidor |
| 7 | Consumo paginado en Angular | `CrudService.listarPaginado` + `ListadoPaginado` + componente `app-paginacion` |
| 8 | Errores de autenticación y autorización | 401 y 403 en JSON (`RestSecurityErrorHandler`); Angular cierra sesión en 401 y muestra el motivo en 403 |
| 9 | Swagger/OpenAPI | `http://localhost:8080/swagger-ui.html` (JSON en `/v3/api-docs`) con botón **Authorize** para el JWT |
| 10 | Validaciones y reglas de negocio | Mensajes en español en todos los DTO y reglas descritas abajo |
| 11 | Pruebas funcionales | 23 pruebas de integración MockMvc + H2 (`mvnw test`), 25 pruebas unitarias en Angular y colección Postman. Ver [`docs/EVIDENCIAS_PRUEBAS.md`](docs/EVIDENCIAS_PRUEBAS.md) |
| 12 | Control de versiones | Rama `feature/t3-integracion` con commits por funcionalidad |

## Requisitos

* JDK 25 y Maven (incluido como `mvnw`).
* MySQL corriendo en `localhost:3306` (la base `db_ecotrackchem` se crea sola).
* Node.js 22+ para el frontend.

## Ejecución

1. Revisar usuario y clave de MySQL en `src/main/resources/application.properties`.
2. Levantar el backend:

```bash
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
```

Al arrancar se crean, si no existen, el usuario `admin@ecotrackchem.com` / `password123` (rol `ADMINISTRADOR`)
y el insumo de prueba "Agua desionizada".

3. Abrir la documentación: <http://localhost:8080/swagger-ui.html>. Ejecutar `POST /auth/authenticate`,
   copiar el `access_token`, pulsar **Authorize** y pegarlo. Desde ahí se prueban todos los endpoints.
4. Levantar el frontend (ver [`frontend/README.md`](frontend/README.md)).

## Endpoints

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/register` | Público. Crea un `OPERADOR_LABORATORIO` (201) |
| POST | `/auth/authenticate` | Público. Devuelve el JWT |
| GET | `/api/v1/usuarios/me` | Cualquier usuario autenticado |
| GET | `/api/v1/usuarios`, `/api/v1/usuarios/{id}` | Solo `ADMINISTRADOR` |
| GET | `/api/v1/{recurso}` | Autenticado. Lista completa (combos y panel) |
| GET | `/api/v1/{recurso}/paginado` | Autenticado. Lista paginada |
| GET | `/api/v1/{recurso}/{id}` | Autenticado |
| POST / PUT | `/api/v1/{recurso}` | Autenticado (201 / 200) |
| DELETE | `/api/v1/{recurso}/{id}` | Solo `ADMINISTRADOR` (204) |

`{recurso}` = `insumos`, `lotes` o `residuos`.

### Paginación

`GET /api/v1/lotes/paginado?pagina=0&tamanio=10&ordenarPor=fechaFabricacion&direccion=desc&buscar=LOT&estado=EN_PROCESO`

| Parámetro | Por defecto | Notas |
|---|---|---|
| `pagina` | 0 | Empieza en 0 |
| `tamanio` | 10 | Entre 1 y 50 |
| `ordenarPor` | depende del recurso | Solo campos permitidos (si no, 400) |
| `direccion` | `asc` / `desc` | |
| `buscar` | vacío | Insumos: nombre o CAS · Lotes: código, insumo o responsable · Residuos: tipo o código de lote |
| filtro | — | `nivelPeligrosidad` (insumos), `estado` (lotes), `disposicionFinal` (residuos) |

Respuesta:

```json
{ "contenido": [ ... ], "pagina": 0, "tamanio": 10, "totalElementos": 23,
  "totalPaginas": 3, "primera": true, "ultima": false }
```

## Reglas de negocio

| Módulo | Regla | Respuesta |
|---|---|---|
| Insumos | El código CAS no se repite | 409 |
| Insumos | No se elimina un insumo usado en lotes | 409 |
| Lotes | El código de lote no se repite (se guarda en mayúsculas) | 409 |
| Lotes | Un lote nuevo no puede nacer `AUDITADO` | 409 |
| Lotes | El estado solo avanza: `EN_PROCESO` → `FINALIZADO` → `AUDITADO` | 409 |
| Lotes | Solo `AUDITOR_AMBIENTAL` o `ADMINISTRADOR` marcan un lote como `AUDITADO` | 403 |
| Lotes | Un lote `AUDITADO` ya no se edita ni se elimina | 409 |
| Lotes | No se elimina un lote con residuos | 409 |
| Lotes | Solo el administrador registra lotes a nombre de otro usuario | 403 |
| Residuos | No se registran, editan ni eliminan residuos de un lote `AUDITADO` | 409 |
| Residuos | `RECOGIDA_ESPECIAL` exige `requiereCertificado = true` | 400 |
| Registro | El correo no se repite; la clave tiene 6–60 caracteres con letras y números | 409 / 400 |

## Formato de errores

Todas las respuestas de error tienen el mismo formato (también 401 y 403 generados por Spring Security):

```json
{ "timestamp": "2026-11-12T10:15:30", "status": 400, "error": "Error de validacion",
  "details": { "codigoCas": "El codigo CAS debe tener el formato NN-NN-N, ej. 7732-18-5" } }
```

| Código | Cuándo |
|---|---|
| 400 | Validación de campos, JSON mal formado, enums o parámetros inválidos |
| 401 | Sin token, token inválido/expirado o credenciales incorrectas |
| 403 | El rol del usuario no permite la acción |
| 404 | El registro no existe |
| 409 | Se viola una regla de negocio o un dato único |

## Problemas frecuentes al levantar el proyecto

| Síntoma | Causa | Solución |
|---|---|---|
| `Communications link failure` al arrancar | MySQL apagado o en otro puerto | Iniciar el servicio de MySQL. Si no usa el 3306, arrancar con la variable `SPRING_DATASOURCE_URL=jdbc:mysql://localhost:<puerto>/db_ecotrackchem?createDatabaseIfNotExist=true&serverTimezone=UTC` sin tocar `application.properties` |
| `Port 8080 was already in use` o el 8080 responde 404 sin JSON | Otro programa usa el puerto (por ejemplo Steam con `steamwebhelper.exe`) | Cerrar ese programa. Para ver cuál es: `netstat -ano \| findstr :8080` y `tasklist /FI "PID eq <pid>"` |
| El login de Angular dice "No se pudo conectar con el servidor" | El backend no está levantado o Angular no corre en `localhost:4200` | Levantar el backend y abrir el frontend en `http://localhost:4200` (origen permitido en `CorsConfig`) |

## Pruebas

```bash
./mvnw test
```

Usan una base H2 en memoria (`src/test/resources/application.properties`), así que no tocan la base MySQL.
También se incluye `postman_collection.json` con las peticiones de la T3 y sus validaciones.

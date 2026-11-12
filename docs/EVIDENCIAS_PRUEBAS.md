# Evidencias de pruebas funcionales — T3

Proyecto: **EcoTrack Chem** · Grupo 07 · Rama `feature/t3-integracion`

Las pruebas se ejecutan de forma automática y se pueden repetir en cualquier PC:

| Capa | Comando | Herramienta | Resultado |
|---|---|---|---|
| Backend | `mvnw test` | JUnit + MockMvc + H2 en memoria | **24 / 24 aprobadas** (12/11/2026 06:24, JDK 25 Temurin, Windows) |
| Frontend | `cd frontend && npm test` | Vitest + Angular TestBed + HttpTestingController | **25 / 25 aprobadas** |
| API manual | `postman_collection.json` | Postman (pestaña *Tests* en cada petición) | Ver sección 3 |

## 1. Pruebas de integración del backend

Archivos: `src/test/java/com/example/ecotrackchem/AutenticacionSeguridadTest.java` y
`PaginacionReglasNegocioTest.java`. Cada prueba levanta la aplicación completa (filtro JWT, Spring Security,
controladores, servicios y JPA) contra una base H2, así que no modifican la base MySQL.

| ID | Escenario | Resultado esperado | Estado |
|---|---|---|---|
| CP01 | Login con credenciales correctas (correo en mayúsculas) | 200 con `access_token` y `refresh_token` | ✅ |
| CP02 | Login con clave incorrecta | 401 "Correo o clave incorrectos" | ✅ |
| CP03 | `GET /api/v1/insumos` sin token | 401 en JSON | ✅ |
| CP04 | Token manipulado | 401 "Token invalido" | ✅ |
| CP05 | `GET /api/v1/insumos` con token válido | 200 | ✅ |
| CP06 | Registro con correo ya existente | 409 | ✅ |
| CP07 | Registro con clave débil | 400 con `details.clave` | ✅ |
| CP08 | Operador lista usuarios | 403 | ✅ |
| CP09 | Operador consulta su perfil `/usuarios/me` | 200 con rol `OPERADOR_LABORATORIO` | ✅ |
| CP10 | Operador elimina un insumo | 403 | ✅ |
| CP11 | Administrador lista usuarios | 200 | ✅ |
| CP12 | `/v3/api-docs` sin token | 200 con esquema de seguridad `bearerAuth` | ✅ |
| CP13 | Insumos paginados (3 registros, tamaño 2) | Página 0 con 2 elementos y `totalPaginas = 2`; página 1 con 1 elemento y `ultima = true` | ✅ |
| CP14 | Lotes filtrados por estado y residuos paginados | 200 con metadatos de paginación | ✅ |
| CP15 | `tamanio=500`, `ordenarPor=clave`, `estado=INEXISTENTE` | 400 en los tres casos | ✅ |
| CP16 | Insumo con código CAS repetido | 409 | ✅ |
| CP17 | Insumo con CAS, nombre, pureza y stock inválidos | 400 con un mensaje por campo | ✅ |
| CP18 | Lote nuevo con estado `AUDITADO` | 409 | ✅ |
| CP19 | Ciclo del lote: avanzar, intentar retroceder, auditar, editar auditado y registrarle un residuo | 200 / 409 / 200 / 409 / 409 | ✅ |
| CP20 | Residuo con recogida especial sin certificado y luego con certificado | 400 y luego 201 | ✅ |
| CP21 | Eliminar insumo con lotes asociados | 409 | ✅ |
| CP22 | Eliminar insumo sin lotes y volver a consultarlo | 204 y luego 404 | ✅ |
| CP23 | Operador registra un lote a nombre de otro usuario | 403 | ✅ |
| — | `contextLoads` (arranque de la aplicación) | Contexto de Spring sin errores | ✅ |

Salida de Maven:

```
[INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0 -- in com.example.ecotrackchem.AutenticacionSeguridadTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0 -- in com.example.ecotrackchem.EcotrackchemApplicationTests
[INFO] Tests run: 11, Failures: 0, Errors: 0, Skipped: 0 -- in com.example.ecotrackchem.PaginacionReglasNegocioTest
[INFO] Tests run: 24, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

## 2. Pruebas unitarias del frontend

| Archivo | Qué comprueba | Pruebas |
|---|---|---|
| `services/auth.service.spec.ts` | Login guarda el JWT en la cookie, lee correo, nombre y rol; rechaza tokens vencidos o mal formados; cerrar sesión borra todo | 5 |
| `guards/auth.guard.spec.ts` | `authGuard` redirige al login con `returnUrl`; `invitadoGuard` envía al panel; `rolGuard` bloquea al operador y deja pasar al administrador | 5 |
| `interceptors/interceptores.spec.ts` | Se envía `Authorization: Bearer` a la API y no a `/auth`; un 401 cierra sesión y redirige; un 403 no cierra sesión | 4 |
| `services/crud.service.spec.ts` | `listarPaginado` envía página, tamaño, orden, búsqueda y filtro; omite los vacíos | 2 |
| `components/shared/paginacion/paginacion.spec.ts` | Rango "11–20 de 25", páginas con puntos suspensivos y botón siguiente | 3 |
| `utils/validadores.spec.ts` | Validadores de formularios, incluido `claveSegura` | 5 |
| `app.spec.ts` | La aplicación se crea | 1 |

```
 Test Files  7 passed (7)
      Tests  25 passed (25)
```

## 3. Colección Postman

`postman_collection.json` (29 peticiones) cubre login, 401 sin token, 401 con clave incorrecta, perfil `/me`,
listados paginados de los tres módulos, paginación inválida (400), CAS duplicado (409), lote nuevo auditado (409)
y recogida especial sin certificado (400). El login guarda el token en la variable `access_token` y todas las
peticiones protegidas lo usan como *Bearer Token*. Para correrla: **Run collection** en Postman.

## 4. Documentación de la API

Con el backend levantado: <http://localhost:8080/swagger-ui.html>. Cada endpoint indica su descripción, los
parámetros de paginación y los códigos de respuesta (200/201/204/400/401/403/404/409). El botón **Authorize**
recibe el `access_token` y lo recuerda al recargar la página.

## 5. Prueba integrada con la base MySQL real

Ejecutada el 12/11/2026 06:41 con el backend levantado (`mvnw spring-boot:run`) contra la base `db_ecotrackchem`
de la PC del equipo (MySQL 8.0). El esquema existente se mantuvo: la T3 no modifica entidades.

| Verificación | Resultado obtenido |
|---|---|
| Arranque | Conexión a `db_ecotrackchem` y Tomcat en el puerto 8080 en 4,2 s |
| `GET /v3/api-docs` | 200 · "EcoTrack Chem API" · 14 rutas documentadas · esquema `bearer` |
| `GET /swagger-ui.html` | Swagger UI cargado |
| `GET /api/v1/insumos` sin token | 401 `{"error":"Debes iniciar sesion para acceder a este recurso"}` |
| Login con clave incorrecta | 401 "Correo o clave incorrectos" |
| Login `admin@ecotrackchem.com` | 200 · el JWT trae `rol: ADMINISTRADOR`, `nombre` e `id` |
| `GET /api/v1/{insumos,lotes,residuos}/paginado?tamanio=5` | 200 en los tres módulos con `totalElementos` y `totalPaginas` |
| `GET /api/v1/usuarios` (administrador) | 200 con los usuarios registrados |
| `GET /api/v1/usuarios/me` | 200 · rol `ADMINISTRADOR` |
| Frontend `http://localhost:4200/insumos` sin sesión | El `authGuard` redirige a `/login?returnUrl=%2Finsumos` |

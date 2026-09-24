>>>>> EcoTrack Chem - Backend 

Proyecto Integrador (T1) — Sistema de trazabilidad química y gestión de residuos para pymes industriales.

Backend desarrollado en Spring Boot con Spring Data JPA, MySQL y Spring Security (JWT)-

-- Descripción y ODS

El proyecto consiste en una API REST que permite a pymes del sector químico registrar insumos o materias primas, llevar el control de los lotes de producción y auditar los residuos generados. 

Aporta al ODS 9 (Industria, Innovación e Infraestructura) al promover un mejor control de insumos y la gestión responsable de residuos en procesos industriales.

-- Entidades del sistema

* Usuario: Operadores, auditores o administradores.
* InsumoQuimico: Materias primas identificadas por código CAS.
* Lote: Registro de producción (asociado a un usuario y a un insumo).
* ResiduoIndustrial: Subproductos o residuos resultantes de un lote.

-- Requisitos de nuestro proyecto

* JDK 25 instalado.
* MySQL Server corriendo localmente en el puerto `3306`.
* Postman para probar los endpoints.

-- Configuración y Ejecución

1. Configurar la base de datos
Abrir el archivo `src/main/resources/application.properties` y cambiar las credenciales por las de el MySQL local:

Estas Propiedades:

spring.datasource.username=root
spring.datasource.password=TU_CONTRASEÑA_AQUI
spring.datasource.url=jdbc:mysql://localhost:3306/db_ecotrackchem?createDatabaseIfNotExist=true&serverTimezone=UTC

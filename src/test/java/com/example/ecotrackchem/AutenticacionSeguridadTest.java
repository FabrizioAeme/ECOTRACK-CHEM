package com.example.ecotrackchem;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

class AutenticacionSeguridadTest extends ApiTestBase {

    @Test
    @DisplayName("CP01 - Login con credenciales correctas devuelve un JWT")
    void loginCorrectoDevuelveToken() throws Exception {
        mvc.perform(post("/auth/authenticate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"correo\":\"ADMIN@ecotrackchem.com\",\"clave\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token", notNullValue()))
                .andExpect(jsonPath("$.refresh_token", notNullValue()));
    }

    @Test
    @DisplayName("CP02 - Login con clave incorrecta responde 401")
    void loginIncorrectoResponde401() throws Exception {
        mvc.perform(post("/auth/authenticate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"correo\":\"admin@ecotrackchem.com\",\"clave\":\"incorrecta\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Correo o clave incorrectos"));
    }

    @Test
    @DisplayName("CP03 - Endpoint protegido sin token responde 401 en JSON")
    void endpointProtegidoSinTokenResponde401() throws Exception {
        mvc.perform(get("/api/v1/insumos"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error", containsString("iniciar sesion")));
    }

    @Test
    @DisplayName("CP04 - Token manipulado responde 401")
    void tokenInvalidoResponde401() throws Exception {
        mvc.perform(get("/api/v1/insumos").header(HttpHeaders.AUTHORIZATION, "Bearer abc.def.ghi"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", containsString("Token invalido")));
    }

    @Test
    @DisplayName("CP05 - Endpoint protegido con token valido responde 200")
    void endpointProtegidoConTokenResponde200() throws Exception {
        mvc.perform(get("/api/v1/insumos").header(HttpHeaders.AUTHORIZATION, bearer(loginAdmin())))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("CP06 - Registro con correo duplicado responde 409")
    void registroDuplicadoResponde409() throws Exception {
        mvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nombres\":\"Otro\",\"apellidos\":\"Admin\",\"correo\":\"admin@ecotrackchem.com\",\"clave\":\"clave123\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("CP07 - Registro con clave debil responde 400 con el detalle del campo")
    void registroClaveDebilResponde400() throws Exception {
        mvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nombres\":\"Luis\",\"apellidos\":\"Rios\",\"correo\":\"luis@ecotrackchem.com\",\"clave\":\"abc\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.clave", notNullValue()));
    }

    @Test
    @DisplayName("CP08 - Un operador no puede listar usuarios (403)")
    void operadorNoPuedeListarUsuarios() throws Exception {
        mvc.perform(get("/api/v1/usuarios").header(HttpHeaders.AUTHORIZATION, bearer(crearOperador())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("CP09 - Cualquier usuario autenticado puede ver su perfil")
    void operadorPuedeVerSuPerfil() throws Exception {
        mvc.perform(get("/api/v1/usuarios/me").header(HttpHeaders.AUTHORIZATION, bearer(crearOperador())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("OPERADOR_LABORATORIO"));
    }

    @Test
    @DisplayName("CP10 - Un operador no puede eliminar registros (403)")
    void operadorNoPuedeEliminar() throws Exception {
        mvc.perform(delete("/api/v1/insumos/1").header(HttpHeaders.AUTHORIZATION, bearer(crearOperador())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CP11 - El administrador si puede listar usuarios")
    void administradorListaUsuarios() throws Exception {
        mvc.perform(get("/api/v1/usuarios").header(HttpHeaders.AUTHORIZATION, bearer(loginAdmin())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].correo", notNullValue()));
    }

    @Test
    @DisplayName("CP12 - La documentacion OpenAPI es publica")
    void documentacionOpenApiEsPublica() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("EcoTrack Chem API"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"));
    }
}

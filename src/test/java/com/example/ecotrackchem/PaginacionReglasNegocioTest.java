package com.example.ecotrackchem;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

class PaginacionReglasNegocioTest extends ApiTestBase {

    private String token;
    private String adminId;

    @BeforeEach
    void iniciarSesion() throws Exception {
        token = loginAdmin();
        adminId = extraer(mvc.perform(get("/api/v1/usuarios/me").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andReturn().getResponse().getContentAsString(), "id");
    }

    private ResultActions enviar(String metodo, String url, String json) throws Exception {
        var builder = switch (metodo) {
            case "POST" -> post(url);
            case "PUT" -> put(url);
            default -> throw new IllegalArgumentException(metodo);
        };
        return mvc.perform(builder.header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json));
    }

    private String crearInsumo(String nombre) throws Exception {
        String json = """
                {"codigoCas":"%s","nombre":"%s","nivelPureza":98.5,"nivelPeligrosidad":"INFLAMABLE","stockDisponible":120}
                """.formatted(codigoCasUnico(), nombre);
        return extraer(enviar("POST", "/api/v1/insumos", json)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(), "id");
    }

    private String loteJson(String codigo, String estado, String insumoId) {
        return """
                {"codigoLote":"%s","fechaFabricacion":"%s","volumenProducido":500,"estado":"%s","usuarioId":%s,"insumoId":%s}
                """.formatted(codigo, LocalDate.now(), estado, adminId, insumoId);
    }

    private String crearLote(String insumoId) throws Exception {
        String codigo = "LOT-T3-" + siguiente();
        return extraer(enviar("POST", "/api/v1/lotes", loteJson(codigo, "EN_PROCESO", insumoId))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(), "id");
    }

    @Test
    @DisplayName("CP13 - El listado paginado de insumos devuelve contenido y metadatos")
    void insumosPaginados() throws Exception {
        String prefijo = "Solvente paginado " + siguiente();
        crearInsumo(prefijo + " A");
        crearInsumo(prefijo + " B");
        crearInsumo(prefijo + " C");

        mvc.perform(get("/api/v1/insumos/paginado")
                .param("buscar", prefijo)
                .param("pagina", "0")
                .param("tamanio", "2")
                .param("ordenarPor", "nombre")
                .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contenido", hasSize(2)))
                .andExpect(jsonPath("$.contenido[0].nombre").value(prefijo + " A"))
                .andExpect(jsonPath("$.totalElementos").value(3))
                .andExpect(jsonPath("$.totalPaginas").value(2))
                .andExpect(jsonPath("$.primera").value(true))
                .andExpect(jsonPath("$.ultima").value(false));

        mvc.perform(get("/api/v1/insumos/paginado")
                .param("buscar", prefijo)
                .param("pagina", "1")
                .param("tamanio", "2")
                .param("ordenarPor", "nombre")
                .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contenido", hasSize(1)))
                .andExpect(jsonPath("$.ultima").value(true));
    }

    @Test
    @DisplayName("CP14 - Lotes y residuos tambien se consultan paginados")
    void lotesYResiduosPaginados() throws Exception {
        crearLote(crearInsumo("Base lote " + siguiente()));
        mvc.perform(get("/api/v1/lotes/paginado").param("estado", "EN_PROCESO")
                .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElementos", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.contenido[0].estado").value("EN_PROCESO"));
        mvc.perform(get("/api/v1/residuos/paginado").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pagina").value(0));
    }

    @Test
    @DisplayName("CP15 - Parametros de paginacion invalidos responden 400")
    void paginacionInvalida() throws Exception {
        mvc.perform(get("/api/v1/insumos/paginado").param("tamanio", "500")
                .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/insumos/paginado").param("ordenarPor", "clave")
                .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("Campos permitidos")));
        mvc.perform(get("/api/v1/lotes/paginado").param("estado", "INEXISTENTE")
                .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("CP16 - No se permite repetir el codigo CAS (409)")
    void codigoCasDuplicado() throws Exception {
        String json = """
                {"codigoCas":"7732-18-5","nombre":"Agua repetida","nivelPureza":99,"nivelPeligrosidad":"NEUTRO","stockDisponible":10}
                """;
        enviar("POST", "/api/v1/insumos", json)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", containsString("7732-18-5")));
    }

    @Test
    @DisplayName("CP17 - Validaciones del insumo responden 400 con mensajes por campo")
    void validacionesInsumo() throws Exception {
        String json = """
                {"codigoCas":"123","nombre":"","nivelPureza":150,"nivelPeligrosidad":"NEUTRO","stockDisponible":-1}
                """;
        enviar("POST", "/api/v1/insumos", json)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.codigoCas").exists())
                .andExpect(jsonPath("$.details.nombre").exists())
                .andExpect(jsonPath("$.details.nivelPureza").exists())
                .andExpect(jsonPath("$.details.stockDisponible").exists());
    }

    @Test
    @DisplayName("CP18 - Un lote nuevo no puede crearse como AUDITADO (409)")
    void loteNuevoNoPuedeSerAuditado() throws Exception {
        String insumoId = crearInsumo("Para auditado " + siguiente());
        enviar("POST", "/api/v1/lotes", loteJson("LOT-AUD-" + siguiente(), "AUDITADO", insumoId))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("CP19 - Un lote auditado no se modifica ni recibe residuos; el estado no retrocede")
    void reglasDeEstadoDelLote() throws Exception {
        String insumoId = crearInsumo("Ciclo de vida " + siguiente());
        String loteId = crearLote(insumoId);
        String codigo = "LOT-CICLO-" + siguiente();

        enviar("PUT", "/api/v1/lotes/" + loteId, loteJson(codigo, "FINALIZADO", insumoId))
                .andExpect(status().isOk());
        enviar("PUT", "/api/v1/lotes/" + loteId, loteJson(codigo, "EN_PROCESO", insumoId))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", containsString("no puede retroceder")));
        enviar("PUT", "/api/v1/lotes/" + loteId, loteJson(codigo, "AUDITADO", insumoId))
                .andExpect(status().isOk());
        enviar("PUT", "/api/v1/lotes/" + loteId, loteJson(codigo, "AUDITADO", insumoId))
                .andExpect(status().isConflict());

        String residuo = """
                {"tipoResiduo":"Solvente gastado","volumenLitros":20,"disposicionFinal":"NEUTRALIZADO","requiereCertificado":false,"loteId":%s}
                """.formatted(loteId);
        enviar("POST", "/api/v1/residuos", residuo)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", containsString("auditado")));
    }

    @Test
    @DisplayName("CP20 - Recogida especial exige certificado (400)")
    void recogidaEspecialExigeCertificado() throws Exception {
        String loteId = crearLote(crearInsumo("Para residuo " + siguiente()));
        String residuo = """
                {"tipoResiduo":"Lodo quimico","volumenLitros":35,"disposicionFinal":"RECOGIDA_ESPECIAL","requiereCertificado":false,"loteId":%s}
                """.formatted(loteId);
        enviar("POST", "/api/v1/residuos", residuo)
                .andExpect(status().isBadRequest());
        enviar("POST", "/api/v1/residuos", residuo.replace("\"requiereCertificado\":false", "\"requiereCertificado\":true"))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("CP21 - No se elimina un insumo con lotes asociados (409)")
    void noSeEliminaInsumoConLotes() throws Exception {
        String insumoId = crearInsumo("Con lotes " + siguiente());
        crearLote(insumoId);
        mvc.perform(delete("/api/v1/insumos/" + insumoId).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", containsString("asociado")));
    }

    @Test
    @DisplayName("CP22 - El administrador elimina un insumo sin lotes (204) y luego no existe (404)")
    void eliminarInsumoSinLotes() throws Exception {
        String insumoId = crearInsumo("Sin lotes " + siguiente());
        mvc.perform(delete("/api/v1/insumos/" + insumoId).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/insumos/" + insumoId).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("CP23 - Un operador no puede registrar lotes a nombre de otro usuario (403)")
    void operadorNoAsignaOtroResponsable() throws Exception {
        String insumoId = crearInsumo("Operador " + siguiente());
        String tokenOperador = crearOperador();
        mvc.perform(post("/api/v1/lotes")
                .header(HttpHeaders.AUTHORIZATION, bearer(tokenOperador))
                .contentType(MediaType.APPLICATION_JSON)
                .content(loteJson("LOT-OP-" + siguiente(), "EN_PROCESO", insumoId)))
                .andExpect(status().isForbidden());
    }
}

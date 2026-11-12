package com.example.ecotrackchem;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import jakarta.servlet.Filter;

@SpringBootTest
public abstract class ApiTestBase {

    protected static final String ADMIN_CORREO = "admin@ecotrackchem.com";
    protected static final String ADMIN_CLAVE = "password123";
    private static final AtomicInteger SECUENCIA = new AtomicInteger(100);

    @Autowired
    private WebApplicationContext context;

    @Autowired
    @Qualifier("springSecurityFilterChain")
    private Filter springSecurityFilterChain;

    protected MockMvc mvc;

    @BeforeEach
    void configurarMockMvc() {
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .addFilters(springSecurityFilterChain)
                .build();
    }

    protected int siguiente() {
        return SECUENCIA.incrementAndGet();
    }

    protected String codigoCasUnico() {
        int n = siguiente();
        return (10000 + n) + "-" + String.format("%02d", n % 100) + "-" + (n % 10);
    }

    protected String login(String correo, String clave) throws Exception {
        MvcResult resultado = mvc.perform(post("/auth/authenticate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"correo\":\"" + correo + "\",\"clave\":\"" + clave + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        return extraer(resultado.getResponse().getContentAsString(), "access_token");
    }

    protected String loginAdmin() throws Exception {
        return login(ADMIN_CORREO, ADMIN_CLAVE);
    }

    protected String crearOperador() throws Exception {
        String correo = "operador" + siguiente() + "@ecotrackchem.com";
        mvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nombres":"Ana","apellidos":"Torres","correo":"%s","clave":"clave123"}
                        """.formatted(correo)))
                .andExpect(status().isCreated());
        return login(correo, "clave123");
    }

    protected String bearer(String token) {
        return "Bearer " + token;
    }

    protected String extraer(String json, String campo) {
        Matcher m = Pattern.compile("\"" + campo + "\"\\s*:\\s*\"?([^\",}]+)\"?").matcher(json);
        if (!m.find()) {
            throw new IllegalStateException("No se encontro el campo " + campo + " en " + json);
        }
        return m.group(1);
    }
}

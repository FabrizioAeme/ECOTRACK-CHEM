package com.example.ecotrackchem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

    private static final String ESQUEMA_JWT = "bearerAuth";

    @Bean
    OpenAPI ecotrackChemOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("EcoTrack Chem API")
                        .version("T3")
                        .description("API REST de trazabilidad quimica y gestion de residuos para pymes industriales. "
                                + "Para probar los endpoints protegidos: ejecuta POST /auth/authenticate, copia el "
                                + "access_token y pegalo en el boton Authorize.")
                        .contact(new Contact().name("Grupo 07 - EcoTrack Chem")))
                .addSecurityItem(new SecurityRequirement().addList(ESQUEMA_JWT))
                .components(new Components()
                        .addSecuritySchemes(ESQUEMA_JWT, new SecurityScheme()
                                .name(ESQUEMA_JWT)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}

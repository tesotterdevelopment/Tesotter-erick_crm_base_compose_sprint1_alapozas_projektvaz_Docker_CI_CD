package com.tesotter_crm_erick.tesotter_crm_erick.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Describes the public API contract; does not change runtime authorization rules. */
@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI crmOpenApi() {
        return new OpenAPI()
            .info(new Info()
                .title("Tesotter Mini CRM API")
                .version("v1")
                .description("CRM reference API: authentication, users and contacts. "
                    + "Deal/Task HTTP endpoints are not implemented yet."))
            .components(new Components().addSecuritySchemes("bearerAuth",
                new SecurityScheme().type(SecurityScheme.Type.HTTP)
                    .scheme("bearer").bearerFormat("JWT")
                    .description("JWT access token from POST /api/v1/auth/login")));
    }
}

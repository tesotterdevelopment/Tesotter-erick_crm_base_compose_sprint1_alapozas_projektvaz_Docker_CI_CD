package com.tesotter_crm_erick.tesotter_crm_erick.security;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("ci")
class AuthorizationIntegrationTest {
 @Autowired MockMvc mvc;
 @Test void anonymousCannotReadContacts() throws Exception {mvc.perform(get("/api/v1/contacts")).andExpect(status().isUnauthorized());}
}

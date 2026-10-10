package com.tesotter_crm_erick.tesotter_crm_erick.repository;
import com.tesotter_crm_erick.tesotter_crm_erick.domain.Contact;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest @ActiveProfiles("ci")
class ContactRepositoryIntegrationTest {
 @Autowired ContactRepository repository;
 @Test void roundTripAgainstMongo() {
  Contact contact=Contact.builder().firstName("Integration").lastName("Test").email("ci-"+java.util.UUID.randomUUID()+"@example.com").build();
  Contact saved=repository.save(contact);
  try { assertTrue(repository.findById(saved.getId()).isPresent()); }
  finally {repository.deleteById(saved.getId());}
 }
}

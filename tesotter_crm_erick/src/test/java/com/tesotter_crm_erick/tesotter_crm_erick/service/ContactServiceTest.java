package com.tesotter_crm_erick.tesotter_crm_erick.service;
import com.tesotter_crm_erick.tesotter_crm_erick.domain.Contact;
import com.tesotter_crm_erick.tesotter_crm_erick.dto.*;
import com.tesotter_crm_erick.tesotter_crm_erick.repository.ContactRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class ContactServiceTest {
 @Test void getExistingContactMapsToDto() {
  ContactRepository repo=mock(ContactRepository.class);
  Contact contact=Contact.builder().id("c1").firstName("Ada").lastName("Lovelace").email("ada@example.com").build();
  when(repo.findById("c1")).thenReturn(Optional.of(contact));
  ContactDto dto=new ContactService(repo,new ContactMapper()).getContact("c1");
  assertEquals("Ada",dto.getFirstName());
  assertEquals("c1",dto.getId());
 }
 @Test void missingContactThrows() {
  ContactRepository repo=mock(ContactRepository.class);
  when(repo.findById("missing")).thenReturn(Optional.empty());
  assertThrows(RuntimeException.class,()->new ContactService(repo,new ContactMapper()).getContact("missing"));
 }
}

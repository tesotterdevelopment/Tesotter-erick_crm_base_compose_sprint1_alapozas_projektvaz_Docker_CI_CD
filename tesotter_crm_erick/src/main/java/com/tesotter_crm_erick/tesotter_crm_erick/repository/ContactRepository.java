package com.tesotter_crm_erick.tesotter_crm_erick.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.tesotter_crm_erick.tesotter_crm_erick.domain.Contact;
import java.util.Optional;
import java.util.List;

@Repository
public interface ContactRepository extends MongoRepository<Contact, String> {
    Optional<Contact> findByEmail(String email);
    List<Contact> findByFirstNameIgnoreCase(String firstName);
    List<Contact> findByCompanyIgnoreCase(String company);
}

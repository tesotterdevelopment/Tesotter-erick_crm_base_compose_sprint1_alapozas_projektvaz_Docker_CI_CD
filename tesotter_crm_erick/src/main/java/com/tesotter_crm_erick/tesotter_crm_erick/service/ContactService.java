package com.tesotter_crm_erick.tesotter_crm_erick.service;

import com.tesotter_crm_erick.tesotter_crm_erick.domain.Contact;
import com.tesotter_crm_erick.tesotter_crm_erick.dto.ContactDto;
import com.tesotter_crm_erick.tesotter_crm_erick.dto.CreateContactRequest;
import com.tesotter_crm_erick.tesotter_crm_erick.dto.ContactMapper;
import com.tesotter_crm_erick.tesotter_crm_erick.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactService {
    private final ContactRepository contactRepository;
    private final ContactMapper contactMapper;

    public ContactDto createContact(CreateContactRequest request) {
        Contact contact = contactMapper.toEntity(request);
        contact.setCreatedAt(LocalDateTime.now());
        contact.setUpdatedAt(LocalDateTime.now());
        Contact saved = contactRepository.save(contact);
        return contactMapper.toDto(saved);
    }

    public ContactDto getContact(String id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        return contactMapper.toDto(contact);
    }

    public List<ContactDto> getAllContacts() {
        return contactRepository.findAll()
                .stream()
                .map(contactMapper::toDto)
                .collect(Collectors.toList());
    }

    public ContactDto updateContact(String id, ContactDto contactDto) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        contactMapper.updateEntityFromDto(contactDto, contact);
        contact.setUpdatedAt(LocalDateTime.now());
        Contact updated = contactRepository.save(contact);
        return contactMapper.toDto(updated);
    }

    public void deleteContact(String id) {
        contactRepository.deleteById(id);
    }

    public ContactDto findByEmail(String email) {
        Contact contact = contactRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        return contactMapper.toDto(contact);
    }
}

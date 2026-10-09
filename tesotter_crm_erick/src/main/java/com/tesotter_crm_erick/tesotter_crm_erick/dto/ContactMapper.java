package com.tesotter_crm_erick.tesotter_crm_erick.dto;

import org.springframework.stereotype.Component;
import com.tesotter_crm_erick.tesotter_crm_erick.domain.Contact;

@Component
public class ContactMapper {
    public ContactDto toDto(Contact contact) {
        if (contact == null) return null;
        return ContactDto.builder()
                .id(contact.getId())
                .firstName(contact.getFirstName())
                .lastName(contact.getLastName())
                .email(contact.getEmail())
                .phoneNumber(contact.getPhoneNumber())
                .company(contact.getCompany())
                .createdAt(contact.getCreatedAt())
                .updatedAt(contact.getUpdatedAt())
                .build();
    }

    public Contact toEntity(ContactDto dto) {
        if (dto == null) return null;
        return Contact.builder()
                .id(dto.getId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .company(dto.getCompany())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }

    public Contact toEntity(CreateContactRequest request) {
        if (request == null) return null;
        return Contact.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .company(request.getCompany())
                .build();
    }

    public void updateEntityFromDto(ContactDto dto, Contact contact) {
        if (dto == null) return;
        contact.setFirstName(dto.getFirstName());
        contact.setLastName(dto.getLastName());
        contact.setEmail(dto.getEmail());
        contact.setPhoneNumber(dto.getPhoneNumber());
        contact.setCompany(dto.getCompany());
    }
}


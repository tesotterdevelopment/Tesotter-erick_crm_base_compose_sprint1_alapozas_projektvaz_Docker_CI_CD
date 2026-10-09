package com.tesotter_crm_erick.tesotter_crm_erick.controller;

import com.tesotter_crm_erick.tesotter_crm_erick.dto.ContactDto;
import com.tesotter_crm_erick.tesotter_crm_erick.dto.CreateContactRequest;
import com.tesotter_crm_erick.tesotter_crm_erick.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
public class ContactController {
    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<ContactDto> createContact(@RequestBody CreateContactRequest request) {
        ContactDto created = contactService.createContact(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactDto> getContact(@PathVariable String id) {
        ContactDto contact = contactService.getContact(id);
        return ResponseEntity.ok(contact);
    }

    @GetMapping
    public ResponseEntity<List<ContactDto>> getAllContacts() {
        List<ContactDto> contacts = contactService.getAllContacts();
        return ResponseEntity.ok(contacts);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactDto> updateContact(
            @PathVariable String id,
            @RequestBody ContactDto contactDto) {
        ContactDto updated = contactService.updateContact(id, contactDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable String id) {
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search/email")
    public ResponseEntity<ContactDto> findByEmail(@RequestParam String email) {
        ContactDto contact = contactService.findByEmail(email);
        return ResponseEntity.ok(contact);
    }
}

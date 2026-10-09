package com.tesotter_crm_erick.tesotter_crm_erick.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateContactRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String company;
}

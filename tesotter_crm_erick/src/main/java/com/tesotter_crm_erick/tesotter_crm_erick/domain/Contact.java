package com.tesotter_crm_erick.tesotter_crm_erick.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Document(collection = "contacts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contact {
    @Id
    private String id;
    private String firstName;
    private String lastName;
    @Indexed(unique=true) private String email;
    private String phoneNumber;
    private String company;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

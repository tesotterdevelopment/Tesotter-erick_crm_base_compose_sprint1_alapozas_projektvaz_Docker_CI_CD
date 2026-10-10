package com.tesotter_crm_erick.tesotter_crm_erick.domain;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Document(collection="deals") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Deal { @Id private String id;
 private String customerId;
 private String title;
 private java.math.BigDecimal amount;
 private String currency;
 private String stage;
 private String assignedTo;
}

package com.tesotter_crm_erick.tesotter_crm_erick.domain;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Document(collection="tasks") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmTask { @Id private String id;
 private String title;
 private String description;
 private String customerId;
 private String dealId;
 private String assignedTo;
 private String status;
 private java.time.Instant dueAt;
}

package com.tesotter_crm_erick.tesotter_crm_erick.user;
import java.util.Set;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
@Document(collection="users") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmUser {
 @Id private String id;
 @Indexed(unique=true) private String email;
 private String passwordHash;
 @Builder.Default private boolean enabled=true;
 @Builder.Default private Set<Role> roles=Set.of(Role.USER);
}

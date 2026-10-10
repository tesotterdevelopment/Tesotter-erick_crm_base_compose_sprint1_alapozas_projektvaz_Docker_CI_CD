package com.tesotter_crm_erick.tesotter_crm_erick.user;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
/** Optional one-time provisioning. Never enable in production without protected secrets. */
@Component
public class AdminBootstrap implements ApplicationRunner {
 private final UserRepository users;private final PasswordEncoder encoder;
 @Value("${crm.bootstrap.email:}") private String email;
 @Value("${crm.bootstrap.password:}") private String password;
 public AdminBootstrap(UserRepository users,PasswordEncoder encoder){this.users=users;this.encoder=encoder;}
 @Override public void run(ApplicationArguments args) {
  if(email.isBlank()&&password.isBlank()) return;
  if(email.isBlank()||password.length()<12) throw new IllegalStateException("Bootstrap email and 12+ character password required");
  String normalized=email.trim().toLowerCase(Locale.ROOT);
  if(users.findByEmail(normalized).isEmpty()) users.save(CrmUser.builder().email(normalized).passwordHash(encoder.encode(password)).roles(Set.of(Role.ADMIN)).build());
 }
}

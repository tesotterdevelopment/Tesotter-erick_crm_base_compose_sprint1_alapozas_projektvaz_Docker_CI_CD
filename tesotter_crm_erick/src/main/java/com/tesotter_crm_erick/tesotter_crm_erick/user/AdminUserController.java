package com.tesotter_crm_erick.tesotter_crm_erick.user;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
@SecurityRequirement(name = "bearerAuth")
@RestController @RequestMapping("/api/v1/admin/users")
public class AdminUserController {
 private final UserRepository users; private final PasswordEncoder encoder;
 public AdminUserController(UserRepository users,PasswordEncoder encoder) {this.users=users;this.encoder=encoder;}
 public record CreateUserRequest(@Email @NotBlank String email,@NotBlank @Size(min=12) String password,Set<Role> roles) {}
 public record UserResponse(String id,String email,boolean enabled,Set<Role> roles) {}
 @PostMapping public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
  String email=req.email().trim().toLowerCase(Locale.ROOT);
  if(users.findByEmail(email).isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).build();
  Set<Role> roles=req.roles()==null||req.roles().isEmpty()?Set.of(Role.USER):Set.copyOf(req.roles());
  CrmUser saved=users.save(CrmUser.builder().email(email).passwordHash(encoder.encode(req.password())).roles(roles).build());
  return ResponseEntity.status(HttpStatus.CREATED).body(new UserResponse(saved.getId(),saved.getEmail(),saved.isEnabled(),saved.getRoles()));
 }
}

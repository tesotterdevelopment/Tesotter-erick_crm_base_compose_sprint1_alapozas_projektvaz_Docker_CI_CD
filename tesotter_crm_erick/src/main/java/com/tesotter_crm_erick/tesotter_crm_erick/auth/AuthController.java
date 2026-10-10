package com.tesotter_crm_erick.tesotter_crm_erick.auth;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/auth")
public class AuthController {
 private final AuthService service;
 public AuthController(AuthService service) {this.service=service;}
 public record LoginRequest(@NotBlank @Email String email,@NotBlank String password) {}
 @PostMapping("/login") public AuthService.TokenResponse login(@Valid @RequestBody LoginRequest req) {return service.login(req.email(),req.password());}
 @SecurityRequirement(name = "bearerAuth")
 @GetMapping("/me") public ResponseEntity<?> me(@AuthenticationPrincipal Jwt jwt) {return ResponseEntity.ok(java.util.Map.of("id",jwt.getSubject(),"roles",jwt.getClaimAsStringList("roles")));}
}

package com.tesotter_crm_erick.tesotter_crm_erick.auth;
import com.tesotter_crm_erick.tesotter_crm_erick.user.*;
import java.time.Instant;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
@Service
public class AuthService {
 private final UserRepository users; private final PasswordEncoder passwordEncoder; private final JwtEncoder encoder;
 private final long ttlSeconds;
 public AuthService(UserRepository users,PasswordEncoder passwordEncoder,JwtEncoder encoder,
                    @Value("${crm.jwt.ttl-seconds:900}") long ttlSeconds) {
  this.users=users;this.passwordEncoder=passwordEncoder;this.encoder=encoder;this.ttlSeconds=ttlSeconds;
 }
 public TokenResponse login(String email,String password) {
  CrmUser user=users.findByEmail(email.trim().toLowerCase(Locale.ROOT))
      .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
  if(!user.isEnabled() || !passwordEncoder.matches(password,user.getPasswordHash()))
     throw new BadCredentialsException("Invalid credentials");
  Instant now=Instant.now();
  JwtClaimsSet claims=JwtClaimsSet.builder().issuer("tesotter-crm").subject(user.getId())
     .issuedAt(now).expiresAt(now.plusSeconds(ttlSeconds))
     .claim("roles",user.getRoles().stream().map(Enum::name).sorted().toList()).build();
  JwsHeader header=JwsHeader.with(MacAlgorithm.HS256).build();
  return new TokenResponse(encoder.encode(JwtEncoderParameters.from(header,claims)).getTokenValue(),"Bearer",ttlSeconds);
 }
 public record TokenResponse(String accessToken,String tokenType,long expiresIn) {}
}

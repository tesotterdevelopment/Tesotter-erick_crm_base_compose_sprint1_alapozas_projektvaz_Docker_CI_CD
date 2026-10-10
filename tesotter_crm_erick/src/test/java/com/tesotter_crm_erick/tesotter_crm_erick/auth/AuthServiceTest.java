package com.tesotter_crm_erick.tesotter_crm_erick.auth;
import com.tesotter_crm_erick.tesotter_crm_erick.user.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class AuthServiceTest {
 @Test void invalidEmailIsRejected() {
  UserRepository users=mock(UserRepository.class);
  AuthService service=new AuthService(users,mock(PasswordEncoder.class),mock(JwtEncoder.class),900);
  when(users.findByEmail("bad@example.com")).thenReturn(Optional.empty());
  assertThrows(BadCredentialsException.class,()->service.login("bad@example.com","wrong"));
 }
 @Test void disabledUserIsRejected() {
  UserRepository users=mock(UserRepository.class);
  when(users.findByEmail("test@example.com")).thenReturn(Optional.of(CrmUser.builder().email("test@example.com").passwordHash("hash").enabled(false).build()));
  AuthService service=new AuthService(users,mock(PasswordEncoder.class),mock(JwtEncoder.class),900);
  assertThrows(BadCredentialsException.class,()->service.login("test@example.com","anything"));
 }
}

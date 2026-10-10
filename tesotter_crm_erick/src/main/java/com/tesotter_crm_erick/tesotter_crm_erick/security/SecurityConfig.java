package com.tesotter_crm_erick.tesotter_crm_erick.security;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.GrantedAuthority;

@Configuration @EnableMethodSecurity
public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder() {return new BCryptPasswordEncoder();}
 @Bean SecretKey jwtSecret(@Value("${crm.jwt.secret}") String value) {
   byte[] key=value.getBytes(StandardCharsets.UTF_8);
   if(key.length<32) throw new IllegalArgumentException("CRM_JWT_SECRET must contain at least 32 UTF-8 bytes");
   return new SecretKeySpec(key,"HmacSHA256");
 }
 @Bean JwtEncoder jwtEncoder(SecretKey key) {return new NimbusJwtEncoder(new ImmutableSecret<>(key));}
 @Bean JwtDecoder jwtDecoder(SecretKey key) {return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();}
 @Bean SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
  
 JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

 converter.setJwtGrantedAuthoritiesConverter(jwt -> {
      Object claim = jwt.getClaim("roles");

      if (!(claim instanceof java.util.Collection<?> values)) {
          return java.util.List.<GrantedAuthority>of();
      }

      return values.stream()
          .map(v -> (GrantedAuthority)
              new SimpleGrantedAuthority("ROLE_" + v))
          .toList();
 });

  return http.csrf(csrf -> csrf.disable()) // Stateless bearer-token API, not cookie auth.
    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .authorizeHttpRequests(auth -> auth
      // OpenAPI JSON and static Swagger UI resources (still 404 when springdoc is disabled).
      .requestMatchers("/api/v3/api-docs", "/api/v3/api-docs/**", "/api/swagger-ui.html", "/swagger-ui/**").permitAll()
      .requestMatchers(HttpMethod.POST,"/api/v1/auth/login").permitAll()
      .requestMatchers(HttpMethod.GET,"/api/v1/auth/me").authenticated()
      .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
      .requestMatchers(HttpMethod.GET,"/api/v1/contacts/**").hasAnyRole("ADMIN","MANAGER","USER")
      .requestMatchers("/api/v1/contacts/**").hasAnyRole("ADMIN","MANAGER")
      .anyRequest().authenticated())
    .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(converter)))
    .build();
 }
}

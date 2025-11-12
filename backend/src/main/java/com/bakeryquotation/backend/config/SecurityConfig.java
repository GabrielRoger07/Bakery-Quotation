package com.bakeryquotation.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private SecurityFilter securityFilter;

    public SecurityConfig(SecurityFilter securityFilter){
        this.securityFilter = securityFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configure(httpSecurity))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST, "/api/v1/companies/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/companies/register").permitAll()
                        .requestMatchers("/ws/**").permitAll()

                        //rotas fornecedor
                        .requestMatchers(HttpMethod.GET, "/api/v1/participations/*/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/participations/*").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/participations/validateToken/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/quotations/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/contains/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/bids/participations/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/bids/lowest").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/bids").permitAll()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}

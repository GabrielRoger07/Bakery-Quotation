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
                        .requestMatchers(HttpMethod.POST, "/api/v1/suppliers/login/**").permitAll()

                        //rotas fornecedor
                        .requestMatchers("/ws/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/participations/*/*").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/participations/*").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/participations/validateToken/*").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/quotations/*").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/contains/*").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/bids/participations/*").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/bids/lowest").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/bids").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/bids/batch").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/participations/supplier").authenticated()

                        //rotas administrador
                        .requestMatchers(HttpMethod.GET, "/api/v1/suppliers").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/suppliers").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/products").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/products").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/quotations").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/quotations").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/v1/companies").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/companies/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/companies/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/companies").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/companies/*").hasRole("ADMIN")

                        .anyRequest().hasRole("COMPANY")
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

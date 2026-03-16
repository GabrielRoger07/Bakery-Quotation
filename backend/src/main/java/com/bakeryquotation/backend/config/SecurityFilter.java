package com.bakeryquotation.backend.config;

import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenConfig tokenConfig;
    private final CompanyRepository companyRepository;

    public SecurityFilter(TokenConfig tokenConfig, CompanyRepository companyRepository){
        this.tokenConfig = tokenConfig;
        this.companyRepository = companyRepository;
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authorizedHeader = request.getHeader("Authorization");
        if(authorizedHeader != null && authorizedHeader.startsWith("Bearer ")){
            String accessToken = authorizedHeader.replace("Bearer ", "");
            String subject = tokenConfig.validateToken(accessToken);
            if(subject != null){
                UserDetails company = companyRepository.findByCompanyEmail(subject).orElseThrow(() -> new ResourceNotFoundException("Company with email " + subject + " does not exists"));

                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(company, null, company.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }

        }
        filterChain.doFilter(request, response);
    }
}

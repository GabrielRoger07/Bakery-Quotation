package com.bakeryquotation.backend.config;

import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Supplier.SupplierRepository;
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
    private final SupplierRepository supplierRepository;

    public SecurityFilter(TokenConfig tokenConfig, CompanyRepository companyRepository, SupplierRepository supplierRepository){
        this.tokenConfig = tokenConfig;
        this.companyRepository = companyRepository;
        this.supplierRepository = supplierRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authorizedHeader = request.getHeader("Authorization");
        if(authorizedHeader != null && authorizedHeader.startsWith("Bearer ")){
            String accessToken = authorizedHeader.replace("Bearer ", "");
            String subject = tokenConfig.validateToken(accessToken);
            String userType = tokenConfig.getUserTypeFromToken(accessToken);

            if(subject != null && userType != null){
                UserDetails userDetails;

                if("SUPPLIER".equals(userType)){
                    userDetails = supplierRepository.findById(Long.parseLong(subject))
                            .map(AuthUserDetails::fromSupplier)
                            .orElseThrow(() -> new ResourceNotFoundException("Supplier with id " + subject + " does not exist"));
                } else {
                    userDetails = companyRepository.findByCompanyEmail(subject)
                            .map(AuthUserDetails::fromCompany)
                            .orElseThrow(() -> new ResourceNotFoundException("Company with email " + subject + " does not exist"));
                }

                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}

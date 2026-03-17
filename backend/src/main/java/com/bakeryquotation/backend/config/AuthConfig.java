package com.bakeryquotation.backend.config;

import com.bakeryquotation.backend.Company.CompanyRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthConfig implements UserDetailsService {

    private final CompanyRepository companyRepository;

    public AuthConfig(CompanyRepository companyRepository){
        this.companyRepository = companyRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String companyEmail) throws UsernameNotFoundException {
        return companyRepository.findByCompanyEmail(companyEmail)
                .map(AuthUserDetails::fromCompany)
                .orElseThrow(() -> new UsernameNotFoundException("Bad Credentials"));
    }
}

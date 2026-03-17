package com.bakeryquotation.backend.config;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRole;
import com.bakeryquotation.backend.Supplier.Supplier;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class AuthUserDetails implements UserDetails {

    private final String username;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public AuthUserDetails(String username, String password, Collection<? extends GrantedAuthority> authorities) {
        this.username = username;
        this.password = password;
        this.authorities = authorities;
    }

    public static AuthUserDetails fromCompany(Company company) {
        List<GrantedAuthority> authorities = company.getRole() == CompanyRole.ADMIN
                ? List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_COMPANY"))
                : List.of(new SimpleGrantedAuthority("ROLE_COMPANY"));

        return new AuthUserDetails(company.getCompanyEmail(), company.getCompanyPassword(), authorities);
    }

    public static AuthUserDetails fromSupplier(Supplier supplier) {
        return new AuthUserDetails(
                supplier.getSupplierWhatsappNumber(),
                supplier.getSupplierPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_SUPPLIER"))
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

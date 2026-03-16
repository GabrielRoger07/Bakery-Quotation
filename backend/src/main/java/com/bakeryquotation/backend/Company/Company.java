package com.bakeryquotation.backend.Company;

import com.bakeryquotation.backend.Product.Product;
import com.bakeryquotation.backend.Quotation.Quotation;
import com.bakeryquotation.backend.Supplier.Supplier;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table( name = "company",
        uniqueConstraints = {
            @UniqueConstraint(name = "company_whatsapp_uk", columnNames = {"companyWhatsappNumber"}),
            @UniqueConstraint(name = "company_email_uk", columnNames = {"companyEmail"}),
        }
)
public class Company implements UserDetails {
    @Id
    @Column(name = "companyCnpj", length = 14)
    private String companyCnpj;

    @Column(name = "companyName", nullable = false, length = 80)
    private String companyName;

    @Column(name = "companyWhatsappNumber", nullable = false, length = 16)
    private String companyWhatsappNumber;

    @Column(name = "companyEmail", nullable = false, length = 60)
    private String companyEmail;

    @Column(name = "companyPassword", nullable = false)
    private String companyPassword;

    @Column(name = "createdAt", nullable = false, columnDefinition = "DATETIME", updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private CompanyRole role = CompanyRole.USER;

    @OneToMany(mappedBy = "company", cascade = {CascadeType.REMOVE}, orphanRemoval = true)
    private List<Product> products;

    @OneToMany(mappedBy = "company", cascade = {CascadeType.REMOVE}, orphanRemoval = true)
    private List<Quotation> quotations;

    @OneToMany(mappedBy = "company", cascade = {CascadeType.REMOVE}, orphanRemoval = true)
    private List<Supplier> suppliers;

    public Company() {
    }

    public Company(String companyCnpj, String companyName, String companyWhatsappNumber, String companyEmail, String companyPassword) {
        this.companyCnpj = companyCnpj;
        this.companyName = companyName;
        this.companyWhatsappNumber = companyWhatsappNumber;
        this.companyEmail = companyEmail;
        this.companyPassword = companyPassword;
        this.createdAt = LocalDateTime.now();
    }

    public Company(String companyCnpj, String companyName, String companyWhatsappNumber, String companyEmail, String companyPassword, LocalDateTime createdAt, List<Product> products, List<Quotation> quotations, List<Supplier> suppliers) {
        this.companyCnpj = companyCnpj;
        this.companyName = companyName;
        this.companyWhatsappNumber = companyWhatsappNumber;
        this.companyEmail = companyEmail;
        this.companyPassword = companyPassword;
        this.createdAt = createdAt;
        this.products = products;
        this.quotations = quotations;
        this.suppliers = suppliers;
    }

    public String getCompanyCnpj() {
        return companyCnpj;
    }

    public void setCompanyCnpj(String companyCnpj) {
        this.companyCnpj = companyCnpj;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyWhatsappNumber() {
        return companyWhatsappNumber;
    }

    public void setCompanyWhatsappNumber(String companyWhatsappNumber) {
        this.companyWhatsappNumber = companyWhatsappNumber;
    }

    public String getCompanyEmail() {
        return companyEmail;
    }

    public void setCompanyEmail(String companyEmail) {
        this.companyEmail = companyEmail;
    }

    public String getCompanyPassword() {
        return companyPassword;
    }

    public void setCompanyPassword(String companyPassword) {
        this.companyPassword = companyPassword;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public CompanyRole getRole() {
        return role;
    }

    public void setRole(CompanyRole role) {
        this.role = role;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

    public List<Quotation> getQuotations() {
        return quotations;
    }

    public void setQuotations(List<Quotation> quotations) {
        this.quotations = quotations;
    }

    public List<Supplier> getSuppliers() {
        return suppliers;
    }

    public void setSuppliers(List<Supplier> suppliers) {
        this.suppliers = suppliers;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if(this.role == CompanyRole.ADMIN){
            return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_USER"));
        }else{
            return List.of(new SimpleGrantedAuthority("ROLE_USER"));
        }
    }

    @Override
    public String getPassword() {
        return companyPassword;
    }

    @Override
    public String getUsername() {
        return companyEmail;
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

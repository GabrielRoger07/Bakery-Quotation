package com.bakeryquotation.backend.Company;

import com.bakeryquotation.backend.Product.Product;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "company")
public class Company {
    @Id
    @Column(name = "companyCnpj", length = 14)
    private String companyCnpj;

    @Column(name = "companyName", nullable = false, length = 45)
    private String companyName;

    @Column(name = "companyWhatsappNumber", unique = true, nullable = false, length = 16)
    private String companyWhatsappNumber;

    @Column(name = "companyEmail", unique = true, nullable = false, length = 60)
    private String companyEmail;

    @Column(name = "companyPassword", nullable = false)
    private String companyPassword;

    @Column(name = "createdAt", nullable = false, columnDefinition = "DATETIME", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "company", cascade = {CascadeType.REMOVE}, orphanRemoval = true)
    private List<Product> products;

    public Company() {
    }

    public Company(String companyCnpj, String companyName, String companyWhatsappNumber, String companyEmail, String companyPassword, LocalDateTime createdAt, List<Product> products) {
        this.companyCnpj = companyCnpj;
        this.companyName = companyName;
        this.companyWhatsappNumber = companyWhatsappNumber;
        this.companyEmail = companyEmail;
        this.companyPassword = companyPassword;
        this.createdAt = createdAt;
        this.products = products;
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

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}

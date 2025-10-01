package com.bakeryquotation.backend.Company;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.br.CNPJ;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "company")
public class Company {
    @Id
    @Column(name = "companyCnpj", length = 14)
    private String companyCnpj;

    @NotNull
    @NotEmpty
    @Column(name = "companyName", nullable = false, length = 45)
    private String companyName;

    @NotNull
    @NotEmpty
    @Column(name = "companyWhatsappNumber", nullable = false, length = 16)
    private String companyWhatsappNumber;

    @NotNull
    @NotEmpty
    @Email(message = "The field need to be an valid email")
    @Column(name = "companyEmail", nullable = false, length = 60)
    private String companyEmail;

    @Column(name = "createdAt", nullable = false, columnDefinition = "DATETIME", updatable = false)
    private LocalDateTime createdAt;

    public Company() {
    }

    public Company(String companyCnpj, String companyName, String companyWhatsappNumber, String companyEmail) {
        this.companyCnpj = companyCnpj;
        this.companyName = companyName;
        this.companyWhatsappNumber = companyWhatsappNumber;
        this.companyEmail = companyEmail;
        this.createdAt = LocalDateTime.now();
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Company company = (Company) o;
        return Objects.equals(companyCnpj, company.companyCnpj) && Objects.equals(companyName, company.companyName) && Objects.equals(companyWhatsappNumber, company.companyWhatsappNumber) && Objects.equals(companyEmail, company.companyEmail) && Objects.equals(createdAt, company.createdAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(companyCnpj, companyName, companyWhatsappNumber, companyEmail, createdAt);
    }
}

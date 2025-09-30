package com.bakeryquotation.backend.Company;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CNPJ;

import java.util.Objects;

@Entity
@Table(name = "company")
public class Company {
    @Id
    @CNPJ
    @Column(name = "company_cnpj", columnDefinition = "VARCHAR(14)")
    private String companyCnpj;

    @NotNull
    @NotEmpty
    @Column(name = "company_name", nullable = false, columnDefinition = "VARCHAR(45)")
    private String companyName;

    public Company() {
    }

    public Company(String companyCnpj, String companyName) {
        this.companyCnpj = companyCnpj;
        this.companyName = companyName;
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

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Company company = (Company) o;
        return Objects.equals(companyCnpj, company.companyCnpj) && Objects.equals(companyName, company.companyName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(companyCnpj, companyName);
    }

    @Override
    public String toString() {
        return "Company{" +
                "companyCnpj='" + companyCnpj + '\'' +
                ", companyName='" + companyName + '\'' +
                '}';
    }
}

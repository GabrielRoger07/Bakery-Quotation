package com.backeryquotation.backend.Company;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "company")
public class Company {
    @Id
    @Column(name = "company_cnpj", nullable = false)
    private String companyCnpj;

    @Column(name = "company_name", nullable = false)
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

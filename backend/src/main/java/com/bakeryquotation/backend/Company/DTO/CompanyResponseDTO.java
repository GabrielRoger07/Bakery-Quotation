package com.bakeryquotation.backend.Company.DTO;

import java.time.LocalDateTime;

public class CompanyResponseDTO {

    private String companyCnpj;
    private String companyName;
    private String companyEmail;
    private String companyWhatsappNumber;
    private LocalDateTime createdAt;

    public CompanyResponseDTO() {
    }

    public CompanyResponseDTO(String companyCnpj, String companyName, String companyEmail, String companyWhatsappNumber, LocalDateTime createdAt) {
        this.companyCnpj = companyCnpj;
        this.companyName = companyName;
        this.companyEmail = companyEmail;
        this.companyWhatsappNumber = companyWhatsappNumber;
        this.createdAt = createdAt;
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

    public String getCompanyEmail() {
        return companyEmail;
    }

    public void setCompanyEmail(String companyEmail) {
        this.companyEmail = companyEmail;
    }

    public String getCompanyWhatsappNumber() {
        return companyWhatsappNumber;
    }

    public void setCompanyWhatsappNumber(String companyWhatsappNumber) {
        this.companyWhatsappNumber = companyWhatsappNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

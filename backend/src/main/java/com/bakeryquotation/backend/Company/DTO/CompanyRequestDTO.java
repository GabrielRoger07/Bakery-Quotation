package com.bakeryquotation.backend.Company.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.br.CNPJ;

public class CompanyRequestDTO {

    @NotNull(message = "CNPJ is required")
    @NotEmpty(message = "CNPJ cannot be empty")
    //@CNPJ(message = "CNPJ must be valid")
    private String companyCnpj;

    @NotNull(message = "Company name is required")
    @NotEmpty(message = "Company name cannot be empty")
    private String companyName;

    @NotNull(message = "Email is required")
    @NotEmpty(message = "Email cannot be empty")
    @Email(message = "Email must be valid")
    private String companyEmail;

    @NotNull(message = "WhatsApp number is required")
    @NotEmpty(message = "WhatsApp number cannot be empty")
    private String companyWhatsappNumber;

    @NotNull(message = "Password is required")
    @NotEmpty(message = "Password cannot be empty")
    private String companyPassword;

    public CompanyRequestDTO() {
    }

    public CompanyRequestDTO(String companyCnpj, String companyName, String companyEmail, String companyWhatsappNumber, String companyPassword) {
        this.companyCnpj = companyCnpj;
        this.companyName = companyName;
        this.companyEmail = companyEmail;
        this.companyWhatsappNumber = companyWhatsappNumber;
        this.companyPassword = companyPassword;
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

    public String getCompanyPassword() {
        return companyPassword;
    }

    public void setCompanyPassword(String companyPassword) {
        this.companyPassword = companyPassword;
    }
}
package com.bakeryquotation.backend.Company;

public class CompanyRequestDTO {

    private String companyCnpj;

    private String companyName;

    private String companyEmail;

    private String companyWhatsappNumber;

    public CompanyRequestDTO() {
    }

    public CompanyRequestDTO(String companyCnpj, String companyName, String companyEmail, String companyWhatsappNumber) {
        this.companyCnpj = companyCnpj;
        this.companyName = companyName;
        this.companyEmail = companyEmail;
        this.companyWhatsappNumber = companyWhatsappNumber;
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
}
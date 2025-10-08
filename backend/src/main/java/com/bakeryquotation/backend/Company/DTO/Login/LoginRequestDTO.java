package com.bakeryquotation.backend.Company.DTO.Login;

public class LoginRequestDTO {

    private String companyCnpj;
    private String companyPassword;

    public LoginRequestDTO() {
    }

    public LoginRequestDTO(String companyCnpj, String companyPassword) {
        this.companyCnpj = companyCnpj;
        this.companyPassword = companyPassword;
    }

    public String getCompanyCnpj() {
        return companyCnpj;
    }

    public void setCompanyCnpj(String companyCnpj) {
        this.companyCnpj = companyCnpj;
    }

    public String getCompanyPassword() {
        return companyPassword;
    }

    public void setCompanyPassword(String companyPassword) {
        this.companyPassword = companyPassword;
    }
}

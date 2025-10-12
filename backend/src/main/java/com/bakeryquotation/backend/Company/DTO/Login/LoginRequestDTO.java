package com.bakeryquotation.backend.Company.DTO.Login;

public class LoginRequestDTO {

    private String companyEmail;
    private String companyPassword;

    public LoginRequestDTO() {
    }

    public LoginRequestDTO(String companyEmail, String companyPassword) {
        this.companyEmail = companyEmail;
        this.companyPassword = companyPassword;
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
}

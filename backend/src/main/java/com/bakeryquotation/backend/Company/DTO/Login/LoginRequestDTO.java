package com.bakeryquotation.backend.Company.DTO.Login;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public class LoginRequestDTO {

    @NotBlank(message = "Company email is required and cannot be blank")
    private String companyEmail;

    @NotEmpty(message = "Company password is required and cannot be empty")
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

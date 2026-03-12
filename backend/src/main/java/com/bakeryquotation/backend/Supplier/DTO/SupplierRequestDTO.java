package com.bakeryquotation.backend.Supplier.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.br.CNPJ;

public class SupplierRequestDTO {

    @NotNull(message = "Supplier name is required")
    @NotEmpty(message = "Supplier name cannot be empty")
    private String supplierName;

    @Email(message = "Email must be valid")
    private String supplierEmail;

    @NotNull(message = "Whatsapp number is required")
    @NotEmpty(message = "Whatsapp number cannot be empty")
    private String supplierWhatsappNumber;

    @NotNull(message = "Employer name is required")
    @NotEmpty(message = "Employer name cannot be empty")
    private String employerName;

    @NotNull(message = "Employer CNPJ is required")
    @NotEmpty(message = "Employer CNPJ cannot be empty")
    @CNPJ(message = "Employer CNPJ must be valid")
    private String employerCnpj;

    public SupplierRequestDTO() {
    }

    public SupplierRequestDTO(String supplierName, String supplierEmail, String supplierWhatsappNumber, String employerName, String employerCnpj) {
        this.supplierName = supplierName;
        this.supplierEmail = supplierEmail;
        this.supplierWhatsappNumber = supplierWhatsappNumber;
        this.employerName = employerName;
        this.employerCnpj = employerCnpj;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getSupplierEmail() {
        return supplierEmail;
    }

    public void setSupplierEmail(String supplierEmail) {
        this.supplierEmail = supplierEmail;
    }

    public String getSupplierWhatsappNumber() {
        return supplierWhatsappNumber;
    }

    public void setSupplierWhatsappNumber(String supplierWhatsappNumber) {
        this.supplierWhatsappNumber = supplierWhatsappNumber;
    }

    public String getEmployerName() {
        return employerName;
    }

    public void setEmployerName(String employerName) {
        this.employerName = employerName;
    }

    public String getEmployerCnpj() {
        return employerCnpj;
    }

    public void setEmployerCnpj(String employerCnpj) {
        this.employerCnpj = employerCnpj;
    }
}

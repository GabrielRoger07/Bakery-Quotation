package com.bakeryquotation.backend.Supplier.DTO.Login;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public class SupplierLoginRequestDTO {

    @NotBlank(message = "Whatsapp number is required and cannot be blank")
    private String supplierWhatsappNumber;

    @NotEmpty(message = "Password is required and cannot be empty")
    private String supplierPassword;

    public SupplierLoginRequestDTO() {
    }

    public SupplierLoginRequestDTO(String supplierWhatsappNumber, String supplierPassword) {
        this.supplierWhatsappNumber = supplierWhatsappNumber;
        this.supplierPassword = supplierPassword;
    }

    public String getSupplierWhatsappNumber() {
        return supplierWhatsappNumber;
    }

    public void setSupplierWhatsappNumber(String supplierWhatsappNumber) {
        this.supplierWhatsappNumber = supplierWhatsappNumber;
    }

    public String getSupplierPassword() {
        return supplierPassword;
    }

    public void setSupplierPassword(String supplierPassword) {
        this.supplierPassword = supplierPassword;
    }
}

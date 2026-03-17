package com.bakeryquotation.backend.Supplier.DTO.Login;

public class SupplierLoginRequestDTO {

    private String supplierWhatsappNumber;
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

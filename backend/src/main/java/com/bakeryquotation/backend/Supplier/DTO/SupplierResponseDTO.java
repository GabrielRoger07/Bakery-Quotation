package com.bakeryquotation.backend.Supplier.DTO;

import java.time.LocalDateTime;

public class SupplierResponseDTO {

    private Long supplierId;
    private String supplierName;
    private String supplierEmail;
    private String supplierWhatsappNumber;
    private String employerName;
    private String employerCnpj;
    private String companyCnpj;
    private LocalDateTime createdAt;

    public SupplierResponseDTO() {
    }

    public SupplierResponseDTO(Long supplierId, String supplierName, String supplierEmail, String supplierWhatsappNumber, String employerName, String employerCnpj, String companyCnpj, LocalDateTime createdAt) {
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.supplierEmail = supplierEmail;
        this.supplierWhatsappNumber = supplierWhatsappNumber;
        this.employerName = employerName;
        this.employerCnpj = employerCnpj;
        this.companyCnpj = companyCnpj;
        this.createdAt = createdAt;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
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

    public String getCompanyCnpj() {
        return companyCnpj;
    }

    public void setCompanyCnpj(String companyCnpj) {
        this.companyCnpj = companyCnpj;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

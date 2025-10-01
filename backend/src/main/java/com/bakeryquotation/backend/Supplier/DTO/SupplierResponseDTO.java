package com.bakeryquotation.backend.Supplier.DTO;

import java.time.LocalDateTime;

public class SupplierResponseDTO {

    private Long supplierId;
    private String workerName;
    private String workerEmail;
    private String workerWhatsappNumber;
    private String companyCnpj;
    private String companyName;
    private LocalDateTime createdAt;

    public SupplierResponseDTO() {
    }

    public SupplierResponseDTO(Long supplierId, String workerName, String workerEmail, String workerWhatsappNumber, String companyCnpj, String companyName, LocalDateTime createdAt) {
        this.supplierId = supplierId;
        this.workerName = workerName;
        this.workerEmail = workerEmail;
        this.workerWhatsappNumber = workerWhatsappNumber;
        this.companyCnpj = companyCnpj;
        this.companyName = companyName;
        this.createdAt = createdAt;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public String getWorkerName() {
        return workerName;
    }

    public void setWorkerName(String workerName) {
        this.workerName = workerName;
    }

    public String getWorkerEmail() {
        return workerEmail;
    }

    public void setWorkerEmail(String workerEmail) {
        this.workerEmail = workerEmail;
    }

    public String getWorkerWhatsappNumber() {
        return workerWhatsappNumber;
    }

    public void setWorkerWhatsappNumber(String workerWhatsappNumber) {
        this.workerWhatsappNumber = workerWhatsappNumber;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

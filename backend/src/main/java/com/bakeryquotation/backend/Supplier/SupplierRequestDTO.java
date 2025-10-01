package com.bakeryquotation.backend.Supplier;

import java.time.LocalDateTime;

public class SupplierRequestDTO {

    private String workerName;
    private String workerEmail;
    private String workerWhatsappNumber;
    private String workerPassword;
    private String companyCnpj;
    private String companyName;

    public SupplierRequestDTO() {
    }

    public SupplierRequestDTO(String workerName, String workerEmail, String workerWhatsappNumber, String workerPassword, String companyCnpj, String companyName) {
        this.workerName = workerName;
        this.workerEmail = workerEmail;
        this.workerWhatsappNumber = workerWhatsappNumber;
        this.workerPassword = workerPassword;
        this.companyCnpj = companyCnpj;
        this.companyName = companyName;
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

    public String getWorkerPassword() {
        return workerPassword;
    }

    public void setWorkerPassword(String workerPassword) {
        this.workerPassword = workerPassword;
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
}

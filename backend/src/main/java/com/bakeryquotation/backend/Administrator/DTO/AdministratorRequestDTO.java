package com.bakeryquotation.backend.Administrator.DTO;

public class AdministratorRequestDTO {

    private String workerName;
    private String workerEmail;
    private String workerWhatsappNumber;
    private String workerPassword;
    private String position;
    private String companyCnpj;

    public AdministratorRequestDTO() {
    }

    public AdministratorRequestDTO(String workerName, String workerEmail, String workerWhatsappNumber, String workerPassword, String position, String companyCnpj) {
        this.workerName = workerName;
        this.workerEmail = workerEmail;
        this.workerWhatsappNumber = workerWhatsappNumber;
        this.workerPassword = workerPassword;
        this.position = position;
        this.companyCnpj = companyCnpj;
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

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getCompanyCnpj() {
        return companyCnpj;
    }

    public void setCompanyCnpj(String companyCnpj) {
        this.companyCnpj = companyCnpj;
    }
}

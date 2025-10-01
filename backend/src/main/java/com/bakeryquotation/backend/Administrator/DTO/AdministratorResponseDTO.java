package com.bakeryquotation.backend.Administrator.DTO;

import java.time.LocalDateTime;

public class AdministratorResponseDTO {

    private Long administratorId;
    private String workerName;
    private String workerEmail;
    private String workerWhatsappNumber;
    private String position;
    private String companyCnpj;
    private LocalDateTime createdAt;

    public AdministratorResponseDTO() {
    }

    public AdministratorResponseDTO(Long administratorId, String workerName, String workerEmail, String workerWhatsappNumber, String position, String companyCnpj, LocalDateTime createdAt) {
        this.administratorId = administratorId;
        this.workerName = workerName;
        this.workerEmail = workerEmail;
        this.workerWhatsappNumber = workerWhatsappNumber;
        this.position = position;
        this.companyCnpj = companyCnpj;
        this.createdAt = createdAt;
    }

    public Long getAdministratorId() {
        return administratorId;
    }

    public void setAdministratorId(Long administratorId) {
        this.administratorId = administratorId;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

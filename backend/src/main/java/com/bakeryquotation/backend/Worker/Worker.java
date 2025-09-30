package com.bakeryquotation.backend.Worker;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Objects;

@MappedSuperclass
public abstract class Worker {

    @NotNull
    @NotEmpty
    @Column(name = "workerName", nullable = false, length = 30)
    protected String workerName;

    @NotNull
    @NotEmpty
    @Column(name = "workerWhatsappNumber", nullable = false, length = 16)
    protected String workerWhatsappNumber;

    @Email
    @Column(name = "workerEmail", length = 60)
    protected String workerEmail;

    @NotNull
    @NotEmpty
    @Column(name = "workerPassword", nullable = false, length = 255)
    protected String workerPassword;

    @Column(name = "createdAt", nullable = false, columnDefinition = "DATETIME", insertable = false, updatable = false)
    protected LocalDateTime createdAt;

    public Worker() {
    }

    public Worker(String workerName, String workerWhatsappNumber, String workerEmail, String workerPassword) {
        this.workerName = workerName;
        this.workerWhatsappNumber = workerWhatsappNumber;
        this.workerEmail = workerEmail;
        this.workerPassword = workerPassword;
    }

    public Worker(String workerName, String workerWhatsappNumber, String workerPassword) {
        this.workerName = workerName;
        this.workerWhatsappNumber = workerWhatsappNumber;
        this.workerPassword = workerPassword;
    }

    public String getWorkerName() {
        return workerName;
    }

    public void setWorkerName(String workerName) {
        this.workerName = workerName;
    }

    public String getWorkerWhatsappNumber() {
        return workerWhatsappNumber;
    }

    public void setWorkerWhatsappNumber(String workerWhatsappNumber) {
        this.workerWhatsappNumber = workerWhatsappNumber;
    }

    public String getWorkerEmail() {
        return workerEmail;
    }

    public void setWorkerEmail(String workerEmail) {
        this.workerEmail = workerEmail;
    }

    public String getWorkerPassword() {
        return workerPassword;
    }

    public void setWorkerPassword(String workerPassword) {
        this.workerPassword = workerPassword;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Worker worker = (Worker) o;
        return Objects.equals(workerName, worker.workerName) && Objects.equals(workerWhatsappNumber, worker.workerWhatsappNumber) && Objects.equals(workerEmail, worker.workerEmail) && Objects.equals(workerPassword, worker.workerPassword) && Objects.equals(createdAt, worker.createdAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(workerName, workerWhatsappNumber, workerEmail, workerPassword, createdAt);
    }
}

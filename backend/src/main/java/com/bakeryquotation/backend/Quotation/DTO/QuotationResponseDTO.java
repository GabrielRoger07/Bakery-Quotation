package com.bakeryquotation.backend.Quotation.DTO;

import com.bakeryquotation.backend.Quotation.Status;

import java.time.LocalDateTime;

public class QuotationResponseDTO {

    private Long quotationId;
    private LocalDateTime quotationStart;
    private LocalDateTime quotationEnd;
    private Status quotationStatus;
    private Long administratorId;
    private LocalDateTime createdAt;

    public QuotationResponseDTO() {
    }

    public QuotationResponseDTO(Long quotationId, LocalDateTime quotationStart, LocalDateTime quotationEnd, Status quotationStatus, Long administratorId, LocalDateTime createdAt) {
        this.quotationId = quotationId;
        this.quotationStart = quotationStart;
        this.quotationEnd = quotationEnd;
        this.quotationStatus = quotationStatus;
        this.administratorId = administratorId;
        this.createdAt = createdAt;
    }

    public Long getQuotationId() {
        return quotationId;
    }

    public void setQuotationId(Long quotationId) {
        this.quotationId = quotationId;
    }

    public LocalDateTime getQuotationStart() {
        return quotationStart;
    }

    public void setQuotationStart(LocalDateTime quotationStart) {
        this.quotationStart = quotationStart;
    }

    public LocalDateTime getQuotationEnd() {
        return quotationEnd;
    }

    public void setQuotationEnd(LocalDateTime quotationEnd) {
        this.quotationEnd = quotationEnd;
    }

    public Status getQuotationStatus() {
        return quotationStatus;
    }

    public void setQuotationStatus(Status quotationStatus) {
        this.quotationStatus = quotationStatus;
    }

    public Long getAdministratorId() {
        return administratorId;
    }

    public void setAdministratorId(Long administratorId) {
        this.administratorId = administratorId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

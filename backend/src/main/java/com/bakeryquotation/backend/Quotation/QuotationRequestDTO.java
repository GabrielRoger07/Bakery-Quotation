package com.bakeryquotation.backend.Quotation;

import java.time.LocalDateTime;

public class QuotationRequestDTO {

    private LocalDateTime quotationStart;
    private LocalDateTime quotationEnd;
    private Status quotationStatus;
    private Long administratorId;

    public QuotationRequestDTO() {
    }

    public QuotationRequestDTO(LocalDateTime quotationStart, LocalDateTime quotationEnd, Status quotationStatus, Long administratorId) {
        this.quotationStart = quotationStart;
        this.quotationEnd = quotationEnd;
        this.quotationStatus = quotationStatus;
        this.administratorId = administratorId;
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
}

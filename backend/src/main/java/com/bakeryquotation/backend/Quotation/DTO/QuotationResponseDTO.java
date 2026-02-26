package com.bakeryquotation.backend.Quotation.DTO;

import java.time.LocalDateTime;

public class QuotationResponseDTO {

    private Long quotationId;
    private LocalDateTime quotationStart;
    private LocalDateTime quotationEnd;
    private Boolean isAuction;
    private String companyCnpj;
    private LocalDateTime createdAt;

    public QuotationResponseDTO() {
    }

    public QuotationResponseDTO(Long quotationId, LocalDateTime quotationStart, LocalDateTime quotationEnd, Boolean isAuction, String companyCnpj, LocalDateTime createdAt) {
        this.quotationId = quotationId;
        this.quotationStart = quotationStart;
        this.quotationEnd = quotationEnd;
        this.isAuction = isAuction;
        this.companyCnpj = companyCnpj;
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

    public Boolean getIsAuction() {
        return isAuction;
    }

    public void setIsAuction(Boolean auction) {
        isAuction = auction;
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

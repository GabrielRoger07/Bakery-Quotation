package com.bakeryquotation.backend.Quotation.DTO;

import java.time.Instant;

public class QuotationResponseDTO {

    private Long quotationId;
    private Instant quotationStart;
    private Instant quotationEnd;
    private Boolean isAuction;
    private String companyCnpj;
    private Instant createdAt;

    public QuotationResponseDTO() {
    }

    public QuotationResponseDTO(Long quotationId, Instant quotationStart, Instant quotationEnd, Boolean isAuction, String companyCnpj, Instant createdAt) {
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

    public Instant getQuotationStart() {
        return quotationStart;
    }

    public void setQuotationStart(Instant quotationStart) {
        this.quotationStart = quotationStart;
    }

    public Instant getQuotationEnd() {
        return quotationEnd;
    }

    public void setQuotationEnd(Instant quotationEnd) {
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

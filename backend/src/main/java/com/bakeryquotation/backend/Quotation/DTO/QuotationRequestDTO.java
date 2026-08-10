package com.bakeryquotation.backend.Quotation.DTO;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class QuotationRequestDTO {

    @NotNull(message = "Quotation start is required")
    private Instant quotationStart;

    @NotNull(message = "Quotation end is required")
    @Future(message = "Quotation end must be in the future")
    private Instant quotationEnd;

    @NotNull(message = "isAuction is required")
    private Boolean isAuction;

    public QuotationRequestDTO() {
    }

    public QuotationRequestDTO(Instant quotationStart, Instant quotationEnd, Boolean isAuction) {
        this.quotationStart = quotationStart;
        this.quotationEnd = quotationEnd;
        this.isAuction = isAuction;
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
}

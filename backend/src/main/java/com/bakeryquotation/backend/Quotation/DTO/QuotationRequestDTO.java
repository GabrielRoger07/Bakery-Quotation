package com.bakeryquotation.backend.Quotation.DTO;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.br.CNPJ;

import java.time.LocalDateTime;

public class QuotationRequestDTO {

    @NotNull(message = "Quotation start is required")
    @Future(message = "Quotation start must be in the future")
    private LocalDateTime quotationStart;

    @NotNull(message = "Quotation end is required")
    @Future(message = "Quotation end must be in the future")
    private LocalDateTime quotationEnd;

    @NotNull(message = "isAuction is required")
    private Boolean isAuction;

    public QuotationRequestDTO() {
    }

    public QuotationRequestDTO(LocalDateTime quotationStart, LocalDateTime quotationEnd, Boolean isAuction) {
        this.quotationStart = quotationStart;
        this.quotationEnd = quotationEnd;
        this.isAuction = isAuction;
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
}

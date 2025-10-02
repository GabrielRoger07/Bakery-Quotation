package com.bakeryquotation.backend.Quotation.DTO;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.br.CNPJ;

import java.time.LocalDateTime;

public class QuotationRequestDTO {

    @NotNull(message = "Quotation start is required")
    @NotEmpty(message = "Quotation start cannot be empty")
    @Future(message = "Quotation start must be in the future")
    private LocalDateTime quotationStart;

    @NotNull(message = "Quotation end is required")
    @NotEmpty(message = "Quotation end cannot be empty")
    @Future(message = "Quotation end must be in the future")
    private LocalDateTime quotationEnd;

    @NotNull(message = "Company CNPJ is required")
    @NotEmpty(message = "Company CNPJ cannot be empty")
    @CNPJ(message = "Company CNPJ must be valid")
    private String companyCnpj;

    public QuotationRequestDTO() {
    }

    public QuotationRequestDTO(LocalDateTime quotationStart, LocalDateTime quotationEnd, String companyCnpj) {
        this.quotationStart = quotationStart;
        this.quotationEnd = quotationEnd;
        this.companyCnpj = companyCnpj;
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

    public String getCompanyCnpj() {
        return companyCnpj;
    }

    public void setCompanyCnpj(String companyCnpj) {
        this.companyCnpj = companyCnpj;
    }
}

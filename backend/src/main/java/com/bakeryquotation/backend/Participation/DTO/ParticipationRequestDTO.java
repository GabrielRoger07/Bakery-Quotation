package com.bakeryquotation.backend.Participation.DTO;

import jakarta.validation.constraints.NotNull;

public class ParticipationRequestDTO {

    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    @NotNull(message = "Quotation ID is required")
    private Long quotationId;

    public ParticipationRequestDTO() {
    }

    public ParticipationRequestDTO(Long supplierId, Long quotationId) {
        this.supplierId = supplierId;
        this.quotationId = quotationId;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public Long getQuotationId() {
        return quotationId;
    }

    public void setQuotationId(Long quotationId) {
        this.quotationId = quotationId;
    }
}

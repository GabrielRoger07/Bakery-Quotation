package com.bakeryquotation.backend.Participation.DTO;

import java.time.LocalDateTime;

public class SupplierParticipationResponseDTO {

    private Long participationId;
    private Long supplierId;
    private String supplierName;
    private String employerName;
    private Long quotationId;
    private LocalDateTime quotationStart;
    private LocalDateTime quotationEnd;

    public SupplierParticipationResponseDTO() {
    }

    public SupplierParticipationResponseDTO(Long participationId, Long supplierId, Long quotationId) {
        this.participationId = participationId;
        this.supplierId = supplierId;
        this.quotationId = quotationId;
    }

    public SupplierParticipationResponseDTO(Long participationId, Long supplierId, Long quotationId, String supplierName, String employerName, LocalDateTime quotationStart, LocalDateTime quotationEnd) {
        this.participationId = participationId;
        this.supplierId = supplierId;
        this.quotationId = quotationId;
        this.supplierName = supplierName;
        this.employerName = employerName;
        this.quotationStart = quotationStart;
        this.quotationEnd = quotationEnd;
    }

    public Long getParticipationId() {
        return participationId;
    }

    public void setParticipationId(Long participationId) {
        this.participationId = participationId;
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

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getEmployerName() {
        return employerName;
    }

    public void setEmployerName(String employerName) {
        this.employerName = employerName;
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
}

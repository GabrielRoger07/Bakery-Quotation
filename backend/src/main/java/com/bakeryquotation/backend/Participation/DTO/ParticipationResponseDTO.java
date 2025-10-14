package com.bakeryquotation.backend.Participation.DTO;

public class ParticipationResponseDTO {

    private Long participationId;
    private String link;
    private String accessToken;
    private Long supplierId;
    private String supplierName;
    private String employerName;
    private Long quotationId;

    public ParticipationResponseDTO() {
    }

    public ParticipationResponseDTO(Long participationId, String link, String accessToken, Long supplierId, Long quotationId) {
        this.participationId = participationId;
        this.link = link;
        this.accessToken = accessToken;
        this.supplierId = supplierId;
        this.quotationId = quotationId;
    }

    public ParticipationResponseDTO(Long participationId, String link, String accessToken, Long supplierId, Long quotationId, String supplierName, String employerName) {
        this.participationId = participationId;
        this.link = link;
        this.accessToken = accessToken;
        this.supplierId = supplierId;
        this.quotationId = quotationId;
        this.supplierName = supplierName;
        this.employerName = employerName;
    }

    public Long getParticipationId() {
        return participationId;
    }

    public void setParticipationId(Long participationId) {
        this.participationId = participationId;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
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
}

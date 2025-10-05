package com.bakeryquotation.backend.Contain.DTO;

import java.math.BigDecimal;

public class ContainResponseDTO {

    private Long productId;
    private Long quotationId;
    private BigDecimal quantity;
    private BigDecimal bonusLimit;

    public ContainResponseDTO() {
    }

    public ContainResponseDTO(Long productId, Long quotationId, BigDecimal quantity, BigDecimal bonusLimit) {
        this.productId = productId;
        this.quotationId = quotationId;
        this.quantity = quantity;
        this.bonusLimit = bonusLimit;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Long getQuotationId() {
        return quotationId;
    }

    public void setQuotationId(Long quotationId) {
        this.quotationId = quotationId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getBonusLimit() {
        return bonusLimit;
    }

    public void setBonusLimit(BigDecimal bonusLimit) {
        this.bonusLimit = bonusLimit;
    }
}

package com.bakeryquotation.backend.Contain;

import jakarta.persistence.Embeddable;

@Embeddable
public class ContainId {

    private Long productId;
    private Long quotationId;

    public ContainId() {
    }

    public ContainId(Long productId, Long quotationId) {
        this.productId = productId;
        this.quotationId = quotationId;
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
}

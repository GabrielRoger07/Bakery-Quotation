package com.bakeryquotation.backend.Contain;

import jakarta.persistence.Embeddable;

@Embeddable
public class ContainId {

    private Long quotationId;
    private Long productId;

    public ContainId() {
    }

    public ContainId(Long quotationId, Long productId) {
        this.quotationId = quotationId;
        this.productId = productId;
    }

    public Long getQuotationId() {
        return quotationId;
    }

    public void setQuotationId(Long quotationId) {
        this.quotationId = quotationId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }
}

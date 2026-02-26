package com.bakeryquotation.backend.Contain;

import jakarta.persistence.Embeddable;

import java.util.Objects;

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

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        ContainId containId = (ContainId) o;
        return Objects.equals(quotationId, containId.quotationId) && Objects.equals(productId, containId.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(quotationId, productId);
    }
}

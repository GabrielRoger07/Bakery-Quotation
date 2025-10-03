package com.bakeryquotation.backend.Bid;

import jakarta.persistence.Embeddable;

@Embeddable
public class BidId {

    private Long participationId;
    private Long productId;

    public BidId() {
    }

    public BidId(Long participationId, Long productId) {
        this.participationId = participationId;
        this.productId = productId;
    }

    public Long getParticipationId() {
        return participationId;
    }

    public void setParticipationId(Long participationId) {
        this.participationId = participationId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }
}

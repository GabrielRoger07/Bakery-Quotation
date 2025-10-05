package com.bakeryquotation.backend.Bid;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.time.LocalDateTime;

@Embeddable
public class BidId {

    private Long participationId;
    private Long productId;

    @Column(columnDefinition = "DATETIME")
    private LocalDateTime createdAt;

    public BidId() {
    }

    public BidId(Long participationId, Long productId) {
        this.participationId = participationId;
        this.productId = productId;
    }

    public BidId(Long participationId, Long productId, LocalDateTime createdAt) {
        this.participationId = participationId;
        this.productId = productId;
        this.createdAt = createdAt;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

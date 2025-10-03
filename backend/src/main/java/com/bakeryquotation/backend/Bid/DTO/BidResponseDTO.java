package com.bakeryquotation.backend.Bid.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BidResponseDTO {

    private Long participationId;
    private Long quotationId;
    private BigDecimal price;
    private BigDecimal quantity;
    private BigDecimal bonus;
    private LocalDateTime createdAt;

    public BidResponseDTO() {
    }

    public BidResponseDTO(Long participationId, Long quotationId, BigDecimal price, BigDecimal quantity, BigDecimal bonus, LocalDateTime createdAt) {
        this.participationId = participationId;
        this.quotationId = quotationId;
        this.price = price;
        this.quantity = quantity;
        this.bonus = bonus;
        this.createdAt = createdAt;
    }

    public Long getParticipationId() {
        return participationId;
    }

    public void setParticipationId(Long participationId) {
        this.participationId = participationId;
    }

    public Long getQuotationId() {
        return quotationId;
    }

    public void setQuotationId(Long quotationId) {
        this.quotationId = quotationId;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getBonus() {
        return bonus;
    }

    public void setBonus(BigDecimal bonus) {
        this.bonus = bonus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

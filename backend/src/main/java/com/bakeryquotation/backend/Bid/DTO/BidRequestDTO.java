package com.bakeryquotation.backend.Bid.DTO;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public class BidRequestDTO {

    @NotNull(message = "Participation ID is required")
    private Long participationId;

    @NotNull(message = "Participation ID is required")
    private Long productId;

    @NotNull(message = "Price is required")
    @Positive(message = "Price needs to be positive")
    private BigDecimal price;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity needs to be positive")
    private BigDecimal quantity;

    @NotNull(message = "Bonus is required")
    @PositiveOrZero(message = "Bonus cannot be negative")
    private BigDecimal bonus;

    public BidRequestDTO() {
    }

    public BidRequestDTO(Long participationId, Long productId, BigDecimal price, BigDecimal quantity, BigDecimal bonus) {
        this.participationId = participationId;
        this.productId = productId;
        this.price = price;
        this.quantity = quantity;
        this.bonus = bonus;
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
}

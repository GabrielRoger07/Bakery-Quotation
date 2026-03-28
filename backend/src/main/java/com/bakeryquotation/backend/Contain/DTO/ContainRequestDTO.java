package com.bakeryquotation.backend.Contain.DTO;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public class ContainRequestDTO {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quotation ID is required")
    private Long quotationId;

    @NotNull(message = "Quantity is required")
    @PositiveOrZero(message = "Quantity cannot be negative")
    private BigDecimal quantity;

    @NotNull(message = "Bonus limit is required")
    @PositiveOrZero(message = "Bonus limit cannot be negative")
    private BigDecimal bonusLimit;

    private String brand;

    public ContainRequestDTO() {
    }

    public ContainRequestDTO(Long productId, Long quotationId, BigDecimal quantity, BigDecimal bonusLimit, String brand) {
        this.productId = productId;
        this.quotationId = quotationId;
        this.quantity = quantity;
        this.bonusLimit = bonusLimit;
        this.brand = brand;
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

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }
}

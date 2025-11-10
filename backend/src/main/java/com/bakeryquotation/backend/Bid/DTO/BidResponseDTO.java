package com.bakeryquotation.backend.Bid.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BidResponseDTO {

    private Long participationId;
    private Long productId;
    private BigDecimal price;
    private BigDecimal quantity;
    private BigDecimal bonus;
    private LocalDateTime createdAt;
    private String productName;
    private String productBarCodeNumber;
    private String supplierName;

    public BidResponseDTO() {
    }

    public BidResponseDTO(Long participationId, Long productId, BigDecimal price, BigDecimal quantity, BigDecimal bonus, LocalDateTime createdAt) {
        this.participationId = participationId;
        this.productId = productId;
        this.price = price;
        this.quantity = quantity;
        this.bonus = bonus;
        this.createdAt = createdAt;
    }

    public BidResponseDTO(Long participationId, Long productId, BigDecimal price, BigDecimal quantity, BigDecimal bonus, LocalDateTime createdAt, String productName, String productBarCodeNumber, String supplierName) {
        this.participationId = participationId;
        this.productId = productId;
        this.price = price;
        this.quantity = quantity;
        this.bonus = bonus;
        this.createdAt = createdAt;
        this.productName = productName;
        this.productBarCodeNumber = productBarCodeNumber;
        this.supplierName = supplierName;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductBarCodeNumber() {
        return productBarCodeNumber;
    }

    public void setProductBarCodeNumber(String productBarCodeNumber) {
        this.productBarCodeNumber = productBarCodeNumber;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }
}

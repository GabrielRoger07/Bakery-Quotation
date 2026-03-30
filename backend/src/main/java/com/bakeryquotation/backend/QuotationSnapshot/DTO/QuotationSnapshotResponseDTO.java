package com.bakeryquotation.backend.QuotationSnapshot.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class QuotationSnapshotResponseDTO {

    private Long snapshotId;
    private Long quotationId;
    private Long productId;
    private Long participationId;
    private String productName;
    private String productDescription;
    private BigDecimal quotedQuantity;
    private String brand;
    private String supplierName;
    private String employerName;
    private String employerCnpj;
    private BigDecimal bidQuantity;
    private BigDecimal bonus;
    private BigDecimal totalPrice;
    private BigDecimal pricePerUnit;
    private LocalDateTime createdAt;

    public QuotationSnapshotResponseDTO() {
    }

    public Long getSnapshotId() { return snapshotId; }
    public void setSnapshotId(Long snapshotId) { this.snapshotId = snapshotId; }

    public Long getQuotationId() { return quotationId; }
    public void setQuotationId(Long quotationId) { this.quotationId = quotationId; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getParticipationId() { return participationId; }
    public void setParticipationId(Long participationId) { this.participationId = participationId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductDescription() { return productDescription; }
    public void setProductDescription(String productDescription) { this.productDescription = productDescription; }

    public BigDecimal getQuotedQuantity() { return quotedQuantity; }
    public void setQuotedQuantity(BigDecimal quotedQuantity) { this.quotedQuantity = quotedQuantity; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public String getEmployerName() { return employerName; }
    public void setEmployerName(String employerName) { this.employerName = employerName; }

    public String getEmployerCnpj() { return employerCnpj; }
    public void setEmployerCnpj(String employerCnpj) { this.employerCnpj = employerCnpj; }

    public BigDecimal getBidQuantity() { return bidQuantity; }
    public void setBidQuantity(BigDecimal bidQuantity) { this.bidQuantity = bidQuantity; }

    public BigDecimal getBonus() { return bonus; }
    public void setBonus(BigDecimal bonus) { this.bonus = bonus; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public BigDecimal getPricePerUnit() { return pricePerUnit; }
    public void setPricePerUnit(BigDecimal pricePerUnit) { this.pricePerUnit = pricePerUnit; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

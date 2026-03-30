package com.bakeryquotation.backend.QuotationSnapshot;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "quotation_snapshot")
public class QuotationSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long snapshotId;

    @Column(nullable = false)
    private Long quotationId;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Long participationId;

    @Column(nullable = false, length = 60)
    private String productName;

    @Column(length = 255)
    private String productDescription;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal quotedQuantity;

    @Column(length = 40)
    private String brand;

    @Column(nullable = false, length = 30)
    private String supplierName;

    @Column(nullable = false, length = 65)
    private String employerName;

    @Column(nullable = false, length = 14)
    private String employerCnpj;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal bidQuantity;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal bonus;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal pricePerUnit;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public QuotationSnapshot() {
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

package com.bakeryquotation.backend.Contain.DTO;

import com.bakeryquotation.backend.Contain.UnitOfMeasure;

import java.math.BigDecimal;

public class ContainResponseDTO {

    private Long productId;
    private Long quotationId;
    private String productBarCodeNumber;
    private String productName;
    private String productDescription;
    private BigDecimal quantity;
    private BigDecimal bonusLimit;
    private String brand;
    private UnitOfMeasure unitOfMeasure;

    public ContainResponseDTO() {
    }

    public ContainResponseDTO(Long productId, Long quotationId, BigDecimal quantity, BigDecimal bonusLimit, String productBarCodeNumber, String productName, String productDescription, String brand, UnitOfMeasure unitOfMeasure) {
        this.productId = productId;
        this.quotationId = quotationId;
        this.quantity = quantity;
        this.bonusLimit = bonusLimit;
        this.productBarCodeNumber = productBarCodeNumber;
        this.productName = productName;
        this.productDescription = productDescription;
        this.brand = brand;
        this.unitOfMeasure = unitOfMeasure;
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

    public String getProductDescription() {
        return productDescription;
    }

    public void setProductDescription(String productDescription) {
        this.productDescription = productDescription;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public UnitOfMeasure getUnitOfMeasure() {
        return unitOfMeasure;
    }

    public void setUnitOfMeasure(UnitOfMeasure unitOfMeasure) {
        this.unitOfMeasure = unitOfMeasure;
    }
}

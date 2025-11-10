package com.bakeryquotation.backend.Product.DTO;

import com.bakeryquotation.backend.Product.UnitOfMeasure;

public class ProductResponseDTO {

    private Long productId;
    private String productName;
    private String productBarCodeNumber;
    private UnitOfMeasure unitOfMeasure;
    private String companyCnpj;

    public ProductResponseDTO() {
    }

    public ProductResponseDTO(Long productId, String productName, String productBarCodeNumber, UnitOfMeasure unitOfMeasure, String companyCnpj) {
        this.productId = productId;
        this.productName = productName;
        this.productBarCodeNumber = productBarCodeNumber;
        this.unitOfMeasure = unitOfMeasure;
        this.companyCnpj = companyCnpj;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
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

    public UnitOfMeasure getUnitOfMeasure() {
        return unitOfMeasure;
    }

    public void setUnitOfMeasure(UnitOfMeasure unitOfMeasure) {
        this.unitOfMeasure = unitOfMeasure;
    }

    public String getCompanyCnpj() {
        return companyCnpj;
    }

    public void setCompanyCnpj(String companyCnpj) {
        this.companyCnpj = companyCnpj;
    }
}

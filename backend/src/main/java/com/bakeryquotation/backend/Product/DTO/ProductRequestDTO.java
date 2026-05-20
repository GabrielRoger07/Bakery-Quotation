package com.bakeryquotation.backend.Product.DTO;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class ProductRequestDTO {

    @NotNull(message = "Product name is required")
    @NotEmpty(message = "Product name cannot be empty")
    private String productName;

    private String productBarCodeNumber;

    private String productDescription;

    public ProductRequestDTO() {
    }

    public ProductRequestDTO(String productName, String productBarCodeNumber, String productDescription) {
        this.productName = productName;
        this.productBarCodeNumber = productBarCodeNumber;
        this.productDescription = productDescription;
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
}

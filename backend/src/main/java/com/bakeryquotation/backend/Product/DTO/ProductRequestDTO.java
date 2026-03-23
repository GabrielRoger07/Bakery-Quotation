package com.bakeryquotation.backend.Product.DTO;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class ProductRequestDTO {

    @NotNull(message = "Product name is required")
    @NotEmpty(message = "Product name cannot be empty")
    private String productName;

    @NotNull(message = "Product Barcode Number is required")
    @NotEmpty(message = "Product Barcode Number cannot be empty")
    private String productBarCodeNumber;

    public ProductRequestDTO() {
    }

    public ProductRequestDTO(String productName, String productBarCodeNumber) {
        this.productName = productName;
        this.productBarCodeNumber = productBarCodeNumber;
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
}

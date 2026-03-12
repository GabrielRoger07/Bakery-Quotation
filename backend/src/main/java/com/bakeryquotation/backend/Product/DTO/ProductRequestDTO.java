package com.bakeryquotation.backend.Product.DTO;

import com.bakeryquotation.backend.Product.UnitOfMeasure;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.br.CNPJ;

public class ProductRequestDTO {

    @NotNull(message = "Product name is required")
    @NotEmpty(message = "Product name cannot be empty")
    private String productName;

    @NotNull(message = "Product Barcode Number is required")
    @NotEmpty(message = "Product Barcode Number cannot be empty")
    private String productBarCodeNumber;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Unit of Measure is required")
    private UnitOfMeasure unitOfMeasure;

    public ProductRequestDTO() {
    }

    public ProductRequestDTO(String productName, String productBarCodeNumber, UnitOfMeasure unitOfMeasure) {
        this.productName = productName;
        this.productBarCodeNumber = productBarCodeNumber;
        this.unitOfMeasure = unitOfMeasure;
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
}

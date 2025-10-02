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

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Unit of Measure is required")
    private UnitOfMeasure unitOfMeasure;

    @NotNull(message = "CNPJ is required")
    @NotEmpty(message = "CNPJ cannot be empty")
    @CNPJ(message = "CNPJ must be valid")
    private String companyCnpj;

    public ProductRequestDTO() {
    }

    public ProductRequestDTO(String productName, UnitOfMeasure unitOfMeasure, String companyCnpj) {
        this.productName = productName;
        this.unitOfMeasure = unitOfMeasure;
        this.companyCnpj = companyCnpj;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
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

package com.bakeryquotation.backend.Product;

public class ProductRequestDTO {

    private String productName;
    private UnitOfMeasure unitOfMeasure;
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

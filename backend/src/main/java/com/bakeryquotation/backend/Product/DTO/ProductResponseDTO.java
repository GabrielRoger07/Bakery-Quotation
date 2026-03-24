package com.bakeryquotation.backend.Product.DTO;

public class ProductResponseDTO {

    private Long productId;
    private String productName;
    private String productBarCodeNumber;
    private String productDescription;
    private String companyCnpj;

    public ProductResponseDTO() {
    }

    public ProductResponseDTO(Long productId, String productName, String productBarCodeNumber, String productDescription, String companyCnpj) {
        this.productId = productId;
        this.productName = productName;
        this.productBarCodeNumber = productBarCodeNumber;
        this.productDescription = productDescription;
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

    public String getProductDescription() {
        return productDescription;
    }

    public void setProductDescription(String productDescription) {
        this.productDescription = productDescription;
    }

    public String getCompanyCnpj() {
        return companyCnpj;
    }

    public void setCompanyCnpj(String companyCnpj) {
        this.companyCnpj = companyCnpj;
    }
}

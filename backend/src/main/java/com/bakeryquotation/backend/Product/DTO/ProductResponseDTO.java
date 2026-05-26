package com.bakeryquotation.backend.Product.DTO;

public class ProductResponseDTO {

    private Long productId;
    private String productName;
    private String productBarCodeNumber;
    private String productDescription;
    private String companyCnpj;
    private Long departmentId;
    private String departmentName;

    public ProductResponseDTO() {
    }

    public ProductResponseDTO(Long productId, String productName, String productBarCodeNumber, String productDescription, String companyCnpj, Long departmentId, String departmentName) {
        this.productId = productId;
        this.productName = productName;
        this.productBarCodeNumber = productBarCodeNumber;
        this.productDescription = productDescription;
        this.companyCnpj = companyCnpj;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
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

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }
}

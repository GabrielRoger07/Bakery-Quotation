package com.bakeryquotation.backend.Product;

import com.bakeryquotation.backend.Bid.Bid;
import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Contain.Contain;
import com.bakeryquotation.backend.Participation.Participation;
import com.bakeryquotation.backend.Quotation.Quotation;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.*;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "productId")
    private Long id;

    @Column(name = "productName", nullable = false, length = 30)
    private String productName;

    @Column(name = "productBarCodeNumber", nullable = false, length = 13)
    private String productBarCodeNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "unitOfMeasure", nullable = false)
    private UnitOfMeasure unitOfMeasure;

    @ManyToOne(fetch = FetchType.EAGER, optional = false, targetEntity = Company.class)
    @JoinColumn(name = "companyCnpj",
                referencedColumnName = "companyCnpj",
                foreignKey = @ForeignKey(
                        name = "PRODUCT_COMPANY_FK"
                ),
                nullable = false
    )
    private Company company;

    @OneToMany(mappedBy = "product", cascade = {CascadeType.REMOVE})
    private List<Contain> contains = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = {CascadeType.REMOVE})
    private List<Bid> bids = new ArrayList<>();

    public Product() {
    }

    public Product(String productName, String productBarCodeNumber, UnitOfMeasure unitOfMeasure, Company company) {
        this.productName = productName;
        this.productBarCodeNumber = productBarCodeNumber;
        this.unitOfMeasure = unitOfMeasure;
        this.company = company;
    }

    public Product(Long id, String productName, UnitOfMeasure unitOfMeasure, Company company, List<Contain> contains, List<Bid> bids) {
        this.id = id;
        this.productName = productName;
        this.unitOfMeasure = unitOfMeasure;
        this.company = company;
        this.contains = contains;
        this.bids = bids;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public List<Contain> getContains() {
        return contains;
    }

    public void setContains(List<Contain> contains) {
        this.contains = contains;
    }

    public List<Bid> getBids() {
        return bids;
    }

    public void setBids(List<Bid> bids) {
        this.bids = bids;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Product product = (Product) o;
        return Objects.equals(id, product.id) && Objects.equals(productName, product.productName) && Objects.equals(productBarCodeNumber, product.productBarCodeNumber) && unitOfMeasure == product.unitOfMeasure && Objects.equals(company, product.company) && Objects.equals(contains, product.contains) && Objects.equals(bids, product.bids);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, productName, productBarCodeNumber, unitOfMeasure, company, contains, bids);
    }
}

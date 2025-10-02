package com.bakeryquotation.backend.Product;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Participation.Participation;
import com.bakeryquotation.backend.Quotation.Quotation;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "productId")
    private Long id;

    @Column(name = "productName", nullable = false, length = 30)
    private String productName;

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

    @ManyToMany(mappedBy = "products")
    private Set<Quotation> quotations = new HashSet<>();

    @ManyToMany(mappedBy = "products")
    private Set<Participation> participations = new HashSet<>();

    public Product() {
    }

    public Product(String productName, UnitOfMeasure unitOfMeasure, Company company) {
        this.productName = productName;
        this.unitOfMeasure = unitOfMeasure;
        this.company = company;
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

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Product product = (Product) o;
        return Objects.equals(id, product.id) && Objects.equals(productName, product.productName) && unitOfMeasure == product.unitOfMeasure && Objects.equals(company, product.company);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, productName, unitOfMeasure, company);
    }
}

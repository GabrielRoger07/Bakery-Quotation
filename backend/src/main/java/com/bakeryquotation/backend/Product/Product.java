package com.bakeryquotation.backend.Product;

import com.bakeryquotation.backend.Bid.Bid;
import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Contain.Contain;
import com.bakeryquotation.backend.Department.Department;
import jakarta.persistence.*;

import java.util.*;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "productId")
    private Long id;

    @Column(name = "productName", nullable = false, length = 60)
    private String productName;

    @Column(name = "productBarCodeNumber", length = 13)
    private String productBarCodeNumber;

    @Column(name = "productDescription")
    private String productDescription;

    @ManyToOne(fetch = FetchType.EAGER, optional = false, targetEntity = Company.class)
    @JoinColumn(name = "companyCnpj",
                referencedColumnName = "companyCnpj",
                foreignKey = @ForeignKey(
                        name = "product_company_fk"
                ),
                nullable = false
    )
    private Company company;

    @ManyToOne(fetch = FetchType.EAGER, optional = false, targetEntity = Department.class)
    @JoinColumn(name = "departmentId",
            referencedColumnName = "departmentId",
            foreignKey = @ForeignKey(
                    name = "product_department_fk"
            ),
            nullable = false
    )
    private Department department;

    @OneToMany(mappedBy = "product", cascade = {CascadeType.REMOVE})
    private List<Contain> contains = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = {CascadeType.REMOVE})
    private List<Bid> bids = new ArrayList<>();

    public Product() {
    }

    public Product(String productName, String productBarCodeNumber, String productDescription, Company company, Department department) {
        this.productName = productName;
        this.productBarCodeNumber = productBarCodeNumber;
        this.productDescription = productDescription;
        this.company = company;
        this.department = department;
    }

    public Product(Long id, String productName, String productBarCodeNumber, String productDescription, Company company, Department department, List<Contain> contains, List<Bid> bids) {
        this.id = id;
        this.productName = productName;
        this.productBarCodeNumber = productBarCodeNumber;
        this.productDescription = productDescription;
        this.company = company;
        this.department = department;
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

    public String getProductDescription() {
        return productDescription;
    }

    public void setProductDescription(String productDescription) {
        this.productDescription = productDescription;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
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
        return Objects.equals(id, product.id) && Objects.equals(productName, product.productName) && Objects.equals(productBarCodeNumber, product.productBarCodeNumber) && Objects.equals(productDescription, product.productDescription) && Objects.equals(company, product.company) && Objects.equals(department, product.department) && Objects.equals(contains, product.contains) && Objects.equals(bids, product.bids);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, productName, productBarCodeNumber, productDescription, company, department, contains, bids);
    }
}

package com.bakeryquotation.backend.Department;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Product.Product;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table( name = "department",
        uniqueConstraints = {
                @UniqueConstraint(name = "department_departmentName_companyCnpj_uk", columnNames = {"departmentName", "companyCnpj"})
        }
)
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "departmentId")
    private Long id;

    @Column(name = "departmentName", nullable = false, length = 25)
    private String departmentName;

    @ManyToOne(fetch = FetchType.EAGER, optional = false, targetEntity = Company.class)
    @JoinColumn(name = "companyCnpj",
            referencedColumnName = "companyCnpj",
            foreignKey = @ForeignKey(
                    name = "department_company_fk"
            ),
            nullable = false
    )
    private Company company;

    @OneToMany(mappedBy = "department", cascade = {CascadeType.REMOVE}, orphanRemoval = true)
    private List<Product> products;

    public Department() {
    }

    public Department(String departmentName, Company company) {
        this.departmentName = departmentName;
        this.company = company;
    }

    public Department(Long id, String departmentName, Company company) {
        this.id = id;
        this.departmentName = departmentName;
        this.company = company;
    }

    public Department(Long id, String departmentName, Company company, List<Product> products) {
        this.id = id;
        this.departmentName = departmentName;
        this.company = company;
        this.products = products;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}

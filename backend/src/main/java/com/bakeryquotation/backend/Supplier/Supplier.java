package com.bakeryquotation.backend.Supplier;

import com.bakeryquotation.backend.Company.Company;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "supplier",
       uniqueConstraints = {
            @UniqueConstraint(name = "SUPPLIER_companyCnpj_whatsapp_UK", columnNames = {"supplierWhatsappNumber", "companyCnpj"}),
            @UniqueConstraint(name = "SUPPLIER_companyCnpj_email_UK", columnNames = {"supplierEmail", "companyCnpj"})
       }
)
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "supplierId")
    private Long id;

    @Column(name = "supplierName", nullable = false, length = 30)
    private String supplierName;

    @Column(name = "supplierEmail", length = 60)
    private String supplierEmail;

    @Column(name = "supplierWhatsappNumber", nullable = false, length = 16)
    private String supplierWhatsappNumber;

    @Column(name = "employerName", nullable = false, length = 45)
    private String employerName;

    @Column(name = "employerCnpj", length = 14)
    private String employerCnpj;

    @Column(name = "createdAt", nullable = false, updatable = false, columnDefinition = "DATETIME")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER, optional = false, targetEntity = Company.class)
    @JoinColumn(name = "companyCnpj",
                referencedColumnName = "companyCnpj",
                foreignKey = @ForeignKey(
                    name = "SUPPLIER_COMPANY_FK"
                ),
                nullable = false
    )
    private Company company;

    public Supplier() {
    }

    public Supplier(String supplierName, String supplierEmail, String supplierWhatsappNumber, String employerName, String employerCnpj, Company company) {
        this.supplierName = supplierName;
        this.supplierEmail = supplierEmail;
        this.supplierWhatsappNumber = supplierWhatsappNumber;
        this.employerName = employerName;
        this.employerCnpj = employerCnpj;
        this.createdAt = LocalDateTime.now();
        this.company = company;
    }

    public Supplier(Long id, String supplierName, String supplierEmail, String supplierWhatsappNumber, String employerName, String employerCnpj, LocalDateTime createdAt, Company company) {
        this.id = id;
        this.supplierName = supplierName;
        this.supplierEmail = supplierEmail;
        this.supplierWhatsappNumber = supplierWhatsappNumber;
        this.employerName = employerName;
        this.employerCnpj = employerCnpj;
        this.createdAt = createdAt;
        this.company = company;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getSupplierEmail() {
        return supplierEmail;
    }

    public void setSupplierEmail(String supplierEmail) {
        this.supplierEmail = supplierEmail;
    }

    public String getSupplierWhatsappNumber() {
        return supplierWhatsappNumber;
    }

    public void setSupplierWhatsappNumber(String supplierWhatsappNumber) {
        this.supplierWhatsappNumber = supplierWhatsappNumber;
    }

    public String getEmployerName() {
        return employerName;
    }

    public void setEmployerName(String employerName) {
        this.employerName = employerName;
    }

    public String getEmployerCnpj() {
        return employerCnpj;
    }

    public void setEmployerCnpj(String employerCnpj) {
        this.employerCnpj = employerCnpj;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }
}

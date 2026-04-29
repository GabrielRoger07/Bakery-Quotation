package com.bakeryquotation.backend.Supplier;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Participation.Participation;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "supplier",
       uniqueConstraints = {
            @UniqueConstraint(name = "supplier_companyCnpj_whatsapp_uk", columnNames = {"supplierWhatsappNumber", "companyCnpj"}),
            @UniqueConstraint(name = "supplier_companyCnpj_email_uk", columnNames = {"supplierEmail", "companyCnpj"})
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

    @Column(name = "employerName", nullable = false, length = 65)
    private String employerName;

    @Column(name = "employerCnpj", nullable = false, length = 14)
    private String employerCnpj;

    @Column(name = "supplierPassword", nullable = false)
    private String supplierPassword;

    @Column(name = "createdAt", nullable = false, updatable = false, columnDefinition = "DATETIME")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.EAGER, optional = false, targetEntity = Company.class)
    @JoinColumn(name = "companyCnpj",
                referencedColumnName = "companyCnpj",
                foreignKey = @ForeignKey(
                    name = "supplier_company_fk"
                ),
                nullable = false
    )
    private Company company;

    @OneToMany(mappedBy = "supplier", cascade = {CascadeType.REMOVE})
    private List<Participation> participations = new ArrayList<>();

    public Supplier() {
    }

    public Supplier(String supplierName, String supplierEmail, String supplierWhatsappNumber, String employerName, String employerCnpj, String supplierPassword, Company company) {
        this.supplierName = supplierName;
        this.supplierEmail = supplierEmail;
        this.supplierWhatsappNumber = supplierWhatsappNumber;
        this.employerName = employerName;
        this.employerCnpj = employerCnpj;
        this.supplierPassword = supplierPassword;
        this.createdAt = Instant.now();
        this.company = company;
    }

    public Supplier(Long id, String supplierName, String supplierEmail, String supplierWhatsappNumber, String employerName, String employerCnpj, String supplierPassword, Instant createdAt, Company company, List<Participation> participations) {
        this.id = id;
        this.supplierName = supplierName;
        this.supplierEmail = supplierEmail;
        this.supplierWhatsappNumber = supplierWhatsappNumber;
        this.employerName = employerName;
        this.employerCnpj = employerCnpj;
        this.supplierPassword = supplierPassword;
        this.createdAt = createdAt;
        this.company = company;
        this.participations = participations;
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

    public String getSupplierPassword() {
        return supplierPassword;
    }

    public void setSupplierPassword(String supplierPassword) {
        this.supplierPassword = supplierPassword;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public List<Participation> getParticipations() {
        return participations;
    }

    public void setParticipations(List<Participation> participations) {
        this.participations = participations;
    }
}

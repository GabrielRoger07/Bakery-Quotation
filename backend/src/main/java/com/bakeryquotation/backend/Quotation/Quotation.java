package com.bakeryquotation.backend.Quotation;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Contain.Contain;
import com.bakeryquotation.backend.Participation.Participation;
import com.bakeryquotation.backend.Product.Product;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "quotation")
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quotationId")
    private Long id;

    @Column(name = "quotationStart", nullable = false, columnDefinition = "DATETIME")
    private LocalDateTime quotationStart;

    @Column(name = "quotationEnd", nullable = false, columnDefinition = "DATETIME")
    private LocalDateTime quotationEnd;

    @Column(name = "createdAt", nullable = false, columnDefinition = "DATETIME", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER, optional = false, targetEntity = Company.class)
    @JoinColumn(name = "companyCnpj",
            referencedColumnName = "companyCnpj",
            foreignKey = @ForeignKey(
                    name = "QUOTATION_COMPANY_FK"
            ),
            nullable = false
    )
    private Company company;

    @OneToMany(mappedBy = "quotation", cascade = {CascadeType.REMOVE})
    private List<Participation> participations = new ArrayList<>();

    @OneToMany(mappedBy = "quotation", cascade = {CascadeType.REMOVE})
    private List<Contain> contains = new ArrayList<>();

    public Quotation() {
    }

    public Quotation(LocalDateTime quotationStart, LocalDateTime quotationEnd, Company company) {
        this.quotationStart = quotationStart;
        this.quotationEnd = quotationEnd;
        this.createdAt = LocalDateTime.now();
        this.company = company;
    }

    public Quotation(Long id, LocalDateTime quotationStart, LocalDateTime quotationEnd, LocalDateTime createdAt, Company company) {
        this.id = id;
        this.quotationStart = quotationStart;
        this.quotationEnd = quotationEnd;
        this.createdAt = createdAt;
        this.company = company;
    }

    public Quotation(Long id, LocalDateTime quotationStart, LocalDateTime quotationEnd, LocalDateTime createdAt, Company company, List<Participation> participations, List<Contain> contains) {
        this.id = id;
        this.quotationStart = quotationStart;
        this.quotationEnd = quotationEnd;
        this.createdAt = createdAt;
        this.company = company;
        this.participations = participations;
        this.contains = contains;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getQuotationStart() {
        return quotationStart;
    }

    public void setQuotationStart(LocalDateTime quotationStart) {
        this.quotationStart = quotationStart;
    }

    public LocalDateTime getQuotationEnd() {
        return quotationEnd;
    }

    public void setQuotationEnd(LocalDateTime quotationEnd) {
        this.quotationEnd = quotationEnd;
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

    public List<Participation> getParticipations() {
        return participations;
    }

    public void setParticipations(List<Participation> participations) {
        this.participations = participations;
    }

    public List<Contain> getContains() {
        return contains;
    }

    public void setContains(List<Contain> contains) {
        this.contains = contains;
    }
}

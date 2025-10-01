package com.bakeryquotation.backend.Quotation;

import com.bakeryquotation.backend.Administrator.Administrator;
import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Product.Product;
import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "quotation")
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quotationId")
    private Long id;

    @NotNull(message = "'Quotation start' is required")
    @Future(message = "'Quotation start' must be in the future")
    @Column(name = "quotationStart", nullable = false, columnDefinition = "DATETIME")
    private LocalDateTime quotationStart;

    @NotNull(message = "'Quotation end' is required")
    @Future(message = "'Quotation end' must be in the future")
    @Column(name = "quotationEnd", nullable = false, columnDefinition = "DATETIME")
    private LocalDateTime quotationEnd;

    @NotNull(message = "'Status' is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "quotationStatus", nullable = false)
    private Status quotationStatus;

    @Column(name = "createdAt", nullable = false, columnDefinition = "DATETIME", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @NotNull(message = "Administrator is required")
    @ManyToOne(fetch = FetchType.EAGER, optional = false, targetEntity = Administrator.class)
    @JoinColumn(name = "administratorId",
            referencedColumnName = "administratorId",
            foreignKey = @ForeignKey(
                    name = "QUOTATION_ADMINISTRATOR_FK"
            ),
            nullable = false
    )
    private Administrator administrator;

    @ManyToMany
    @JoinTable(
            name = "contain",
            joinColumns = @JoinColumn(name = "quotationId"),
            inverseJoinColumns = @JoinColumn(name = "productId")
    )
    private Set<Product> products = new HashSet<>();

    public Quotation() {
    }

    public Quotation(LocalDateTime quotationStart, LocalDateTime quotationEnd, Administrator administrator) {
        this.quotationStart = quotationStart;
        this.quotationEnd = quotationEnd;
        this.administrator = administrator;
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

    public Status getQuotationStatus() {
        return quotationStatus;
    }

    public void setQuotationStatus(Status quotationStatus) {
        this.quotationStatus = quotationStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Administrator getAdministrator() {
        return administrator;
    }

    public void setAdministrator(Administrator administrator) {
        this.administrator = administrator;
    }

    public Set<Product> getProducts() {
        return products;
    }

    public void setProducts(Set<Product> products) {
        this.products = products;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Quotation quotation = (Quotation) o;
        return Objects.equals(id, quotation.id) && Objects.equals(quotationStart, quotation.quotationStart) && Objects.equals(quotationEnd, quotation.quotationEnd) && quotationStatus == quotation.quotationStatus && Objects.equals(createdAt, quotation.createdAt) && Objects.equals(administrator, quotation.administrator) && Objects.equals(products, quotation.products);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, quotationStart, quotationEnd, quotationStatus, createdAt, administrator, products);
    }
}

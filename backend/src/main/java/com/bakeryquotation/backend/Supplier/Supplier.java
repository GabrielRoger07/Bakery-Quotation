package com.bakeryquotation.backend.Supplier;

import com.bakeryquotation.backend.Worker.Worker;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Objects;

@Entity
@Table(name = "supplier")
public class Supplier extends Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "supplierId")
    private Long id;

    @NotNull
    @NotEmpty
    @Column(name = "companyName", nullable = false, length = 45)
    private String companyName;

    @Column(name = "companyCnpj", length = 14)
    private String companyCnpj;

    public Supplier() {
        super();
    }

    public Supplier(String workerName, String workerWhatsappNumber, String workerEmail, String workerPassword, String companyName, String companyCnpj) {
        super(workerName, workerWhatsappNumber, workerEmail, workerPassword);
        this.companyName = companyName;
        this.companyCnpj = companyCnpj;
    }

    public Supplier(String workerName, String workerWhatsappNumber, String workerPassword, String companyName, String companyCnpj) {
        super(workerName, workerWhatsappNumber, workerPassword);
        this.companyName = companyName;
        this.companyCnpj = companyCnpj;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyCnpj() {
        return companyCnpj;
    }

    public void setCompanyCnpj(String companyCnpj) {
        this.companyCnpj = companyCnpj;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        Supplier supplier = (Supplier) o;
        return Objects.equals(id, supplier.id) && Objects.equals(companyName, supplier.companyName) && Objects.equals(companyCnpj, supplier.companyCnpj);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), id, companyName, companyCnpj);
    }
}

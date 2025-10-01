package com.bakeryquotation.backend.Administrator;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Worker.Worker;
import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "administrator")
public class Administrator extends Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "administratorId")
    private Long id;

    @Column(name = "position", length = 30)
    private String position;

    @ManyToOne(fetch = FetchType.EAGER, optional = false, targetEntity = Company.class)
    @JoinColumn(name = "companyCnpj",
            referencedColumnName = "companyCnpj",
            foreignKey = @ForeignKey(
                    name = "ADMINISTRATOR_COMPANY_FK"
            ),
            nullable = false
    )
    private Company company;

    public Administrator() {
        super();
    }

    public Administrator(String workerName, String workerWhatsappNumber, String workerEmail, String workerPassword, String position, Company company) {
        super(workerName, workerWhatsappNumber, workerEmail, workerPassword);
        this.position = position;
        this.company = company;
    }

    public Administrator(String workerName, String workerWhatsappNumber, String workerPassword, String position, Company company) {
        super(workerName, workerWhatsappNumber, workerPassword);
        this.position = position;
        this.company = company;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
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
        if (!super.equals(o)) return false;
        Administrator that = (Administrator) o;
        return Objects.equals(id, that.id) && Objects.equals(position, that.position) && Objects.equals(company, that.company);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), id, position, company);
    }
}

package com.bakeryquotation.backend.Quotation;

import com.bakeryquotation.backend.Company.Company;
import jakarta.persistence.*;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "quotation")
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;

    private Status status;

    @ManyToOne
    private Company company;

    public Quotation() {
    }

    public Quotation(LocalDateTime startDateTime, LocalDateTime endDateTime, Status status, Company company) {
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.status = status;
        this.company = company;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(LocalDateTime startDateTime) {
        this.startDateTime = startDateTime;
    }

    public LocalDateTime getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(LocalDateTime endDateTime) {
        this.endDateTime = endDateTime;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
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
        Quotation quotation = (Quotation) o;
        return Objects.equals(id, quotation.id) && Objects.equals(startDateTime, quotation.startDateTime) && Objects.equals(endDateTime, quotation.endDateTime) && status == quotation.status && Objects.equals(company, quotation.company);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, startDateTime, endDateTime, status, company);
    }
}

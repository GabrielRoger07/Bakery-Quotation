package com.bakeryquotation.backend.Quotation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    List<Quotation> findByCompany_CompanyCnpj(String companyCompanyCnpj);

    Page<Quotation> findByCompany_CompanyEmail(String companyCompanyEmail, Pageable pageable);

    @Query("SELECT q FROM Quotation q WHERE q.company.companyEmail = :companyEmail AND (" +
           "(:value = 'agendado' AND q.quotationStart > :now) OR " +
           "(:value = 'ativo' AND q.quotationStart <= :now AND q.quotationEnd >= :now) OR " +
           "(:value = 'fechado' AND q.quotationEnd < :now))")
    Page<Quotation> findByCompanyEmailAndStatus(String companyEmail, String value, Instant now, Pageable pageable);
}
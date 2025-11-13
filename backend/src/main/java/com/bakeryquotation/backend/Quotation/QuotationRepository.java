package com.bakeryquotation.backend.Quotation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    List<Quotation> findByCompany_CompanyCnpj(String companyCompanyCnpj);

    Page<Quotation> findByCompany_CompanyCnpj(String companyCompanyCnpj, Pageable pageable);
}

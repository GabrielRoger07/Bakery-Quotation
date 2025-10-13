package com.bakeryquotation.backend.Quotation;

import com.bakeryquotation.backend.Supplier.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    List<Quotation> findByCompany_CompanyCnpj(String companyCompanyCnpj);
}

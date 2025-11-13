package com.bakeryquotation.backend.Supplier;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    boolean findBySupplierEmail(String supplierEmail);

    Optional<Supplier> findByCompany_CompanyCnpjAndSupplierEmail(String companyCompanyCnpj, String supplierEmail);

    Optional<Supplier> findByCompany_CompanyCnpjAndSupplierWhatsappNumber(String companyCompanyCnpj, String supplierWhatsappNumber);

    List<Supplier> findByCompany_CompanyCnpj(String companyCompanyCnpj);
}

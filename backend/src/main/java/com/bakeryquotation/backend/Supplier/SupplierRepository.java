package com.bakeryquotation.backend.Supplier;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    boolean findBySupplierEmail(String supplierEmail);

    Optional<Supplier> findByCompany_CompanyCnpjAndSupplierEmail(String companyCompanyCnpj, String supplierEmail);

    Optional<Supplier> findByCompany_CompanyCnpjAndSupplierWhatsappNumber(String companyCompanyCnpj, String supplierWhatsappNumber);

    Page<Supplier> findByCompany_CompanyCnpj(String companyCompanyCnpj, Pageable pageable);

    Page<Supplier> findByCompany_CompanyCnpjAndEmployerCnpjContainsIgnoreCase(String companyCompanyCnpj, String employerCnpj, Pageable pageable);

    Page<Supplier> findByCompany_CompanyCnpjAndEmployerNameContainingIgnoreCase(String companyCompanyCnpj, String employerName, Pageable pageable);

    Page<Supplier> findByCompany_CompanyCnpjAndSupplierWhatsappNumberContainingIgnoreCase(String companyCompanyCnpj, String supplierWhatsappNumber, Pageable pageable);

    Page<Supplier> findByCompany_CompanyCnpjAndSupplierEmailContainingIgnoreCase(String companyCompanyCnpj, String supplierEmail, Pageable pageable);

    Page<Supplier> findByCompany_CompanyCnpjAndSupplierNameContainingIgnoreCase(String companyCompanyCnpj, String supplierName, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.company.companyCnpj = :cnpj AND s.id NOT IN :excludedIds")
    Page<Supplier> findByCompanyCnpjExcludingIds(String cnpj, List<Long> excludedIds, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.company.companyCnpj = :cnpj AND LOWER(s.employerCnpj) LIKE LOWER(CONCAT('%', :value, '%')) AND s.id NOT IN :excludedIds")
    Page<Supplier> findByCompanyCnpjAndEmployerCnpjExcludingIds(String cnpj, String value, List<Long> excludedIds, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.company.companyCnpj = :cnpj AND LOWER(s.employerName) LIKE LOWER(CONCAT('%', :value, '%')) AND s.id NOT IN :excludedIds")
    Page<Supplier> findByCompanyCnpjAndEmployerNameExcludingIds(String cnpj, String value, List<Long> excludedIds, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.company.companyCnpj = :cnpj AND LOWER(s.supplierWhatsappNumber) LIKE LOWER(CONCAT('%', :value, '%')) AND s.id NOT IN :excludedIds")
    Page<Supplier> findByCompanyCnpjAndWhatsappExcludingIds(String cnpj, String value, List<Long> excludedIds, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.company.companyCnpj = :cnpj AND LOWER(s.supplierEmail) LIKE LOWER(CONCAT('%', :value, '%')) AND s.id NOT IN :excludedIds")
    Page<Supplier> findByCompanyCnpjAndEmailExcludingIds(String cnpj, String value, List<Long> excludedIds, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.company.companyCnpj = :cnpj AND LOWER(s.supplierName) LIKE LOWER(CONCAT('%', :value, '%')) AND s.id NOT IN :excludedIds")
    Page<Supplier> findByCompanyCnpjAndSupplierNameExcludingIds(String cnpj, String value, List<Long> excludedIds, Pageable pageable);
}

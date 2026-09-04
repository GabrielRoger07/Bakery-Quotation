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

    Optional<Supplier> findByCompany_CompanyEmailAndSupplierEmailAndEmployerCnpj(String companyCompanyEmail, String supplierEmail, String employerCnpj);

    Optional<Supplier> findByCompany_CompanyEmailAndSupplierWhatsappNumberAndEmployerCnpj(String companyCompanyEmail, String supplierWhatsappNumber, String employerCnpj);

    Optional<Supplier> findByCompany_CompanyCnpjAndSupplierWhatsappNumber(String companyCompanyCnpj, String supplierWhatsappNumber);

    Page<Supplier> findByCompany_CompanyEmail(String companyCompanyEmail, Pageable pageable);

    Page<Supplier> findByCompany_CompanyEmailAndEmployerCnpjContainsIgnoreCase(String companyCompanyEmail, String employerCnpj, Pageable pageable);

    Page<Supplier> findByCompany_CompanyEmailAndEmployerNameContainingIgnoreCase(String companyCompanyEmail, String employerName, Pageable pageable);

    Page<Supplier> findByCompany_CompanyEmailAndSupplierWhatsappNumberContainingIgnoreCase(String companyCompanyEmail, String supplierWhatsappNumber, Pageable pageable);

    Page<Supplier> findByCompany_CompanyEmailAndSupplierEmailContainingIgnoreCase(String companyCompanyEmail, String supplierEmail, Pageable pageable);

    Page<Supplier> findByCompany_CompanyEmailAndSupplierNameContainingIgnoreCase(String companyCompanyEmail, String supplierName, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.company.companyEmail = :email AND s.id NOT IN :excludedIds")
    Page<Supplier> findByCompanyEmailExcludingIds(String email, List<Long> excludedIds, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.company.companyEmail = :email AND LOWER(s.employerCnpj) LIKE LOWER(CONCAT('%', :value, '%')) AND s.id NOT IN :excludedIds")
    Page<Supplier> findByCompanyEmailAndEmployerCnpjExcludingIds(String email, String value, List<Long> excludedIds, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.company.companyEmail = :email AND LOWER(s.employerName) LIKE LOWER(CONCAT('%', :value, '%')) AND s.id NOT IN :excludedIds")
    Page<Supplier> findByCompanyEmailAndEmployerNameExcludingIds(String email, String value, List<Long> excludedIds, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.company.companyEmail = :email AND LOWER(s.supplierWhatsappNumber) LIKE LOWER(CONCAT('%', :value, '%')) AND s.id NOT IN :excludedIds")
    Page<Supplier> findByCompanyEmailAndWhatsappExcludingIds(String email, String value, List<Long> excludedIds, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.company.companyEmail = :email AND LOWER(s.supplierEmail) LIKE LOWER(CONCAT('%', :value, '%')) AND s.id NOT IN :excludedIds")
    Page<Supplier> findByCompanyEmailAndEmailExcludingIds(String email, String value, List<Long> excludedIds, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.company.companyEmail = :email AND LOWER(s.supplierName) LIKE LOWER(CONCAT('%', :value, '%')) AND s.id NOT IN :excludedIds")
    Page<Supplier> findByCompanyEmailAndSupplierNameExcludingIds(String email, String value, List<Long> excludedIds, Pageable pageable);
}

package com.bakeryquotation.backend.Product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCompany_CompanyCnpj(String cnpj);

    Page<Product> findByCompany_CompanyEmail(String companyCompanyEmail, Pageable pageable);

    Page<Product> findByCompany_CompanyEmailAndProductNameContainsIgnoreCase(String companyCompanyEmail, String productName, Pageable pageable);

    Page<Product> findByCompany_CompanyEmailAndProductBarCodeNumberContainsIgnoreCase(String companyCompanyEmail, String productBarCodeNumber, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.company.companyEmail = :companyEmail AND p.id NOT IN :excludedIds")
    Page<Product> findByCompanyEmailExcludingIds(String companyEmail, List<Long> excludedIds, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.company.companyEmail = :companyEmail AND LOWER(p.productName) LIKE LOWER(CONCAT('%', :value, '%')) AND p.id NOT IN :excludedIds")
    Page<Product> findByCompanyEmailAndNameExcludingIds(String companyEmail, String value, List<Long> excludedIds, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.company.companyEmail = :companyEmail AND LOWER(p.productBarCodeNumber) LIKE LOWER(CONCAT('%', :value, '%')) AND p.id NOT IN :excludedIds")
    Page<Product> findByCompanyEmailAndBarcodeExcludingIds(String companyEmail, String value, List<Long> excludedIds, Pageable pageable);
}
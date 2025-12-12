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

    Page<Product> findByCompany_CompanyCnpj(String companyCompanyCnpj, Pageable pageable);

    Page<Product> findByCompany_CompanyCnpjAndProductNameContainsIgnoreCase(String companyCompanyCnpj, String productName, Pageable pageable);

    Page<Product> findByCompany_CompanyCnpjAndProductBarCodeNumberContainsIgnoreCase(String companyCompanyCnpj, String productBarCodeNumber, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.company.companyCnpj = :cnpj AND p.id NOT IN :excludedIds")
    Page<Product> findByCompanyCnpjExcludingIds(String cnpj, List<Long> excludedIds, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.company.companyCnpj = :cnpj AND LOWER(p.productName) LIKE LOWER(CONCAT('%', :value, '%')) AND p.id NOT IN :excludedIds")
    Page<Product> findByCompanyCnpjAndNameExcludingIds(String cnpj, String value, List<Long> excludedIds, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.company.companyCnpj = :cnpj AND LOWER(p.productBarCodeNumber) LIKE LOWER(CONCAT('%', :value, '%')) AND p.id NOT IN :excludedIds")
    Page<Product> findByCompanyCnpjAndBarcodeExcludingIds(String cnpj, String value, List<Long> excludedIds, Pageable pageable);
}

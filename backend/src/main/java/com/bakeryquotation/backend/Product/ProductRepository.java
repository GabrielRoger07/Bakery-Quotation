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
}

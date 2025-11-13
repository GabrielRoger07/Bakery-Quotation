package com.bakeryquotation.backend.Company;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, String> {

    Optional<Company> findByCompanyWhatsappNumber(String companyWhatsappNumber);

    Boolean existsCompanyByCompanyEmail(String companyEmail);

    Optional<UserDetails> findByCompanyEmail(String companyEmail);
}

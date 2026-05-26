package com.bakeryquotation.backend.Department;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Page<Department> findByCompany_CompanyEmail(String companyCompanyEmail, Pageable pageable);

    List<Department> findByCompany_CompanyEmail(String companyEmail);

    Page<Department> findByCompany_CompanyEmailAndDepartmentNameContainsIgnoreCase(String companyCompanyEmail, String departmentName, Pageable pageable);
}

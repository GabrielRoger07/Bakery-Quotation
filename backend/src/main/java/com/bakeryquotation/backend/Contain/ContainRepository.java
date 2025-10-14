package com.bakeryquotation.backend.Contain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContainRepository extends JpaRepository<Contain, ContainId> {
    List<Contain> findAllByQuotation_Id(Long quotationId);
}

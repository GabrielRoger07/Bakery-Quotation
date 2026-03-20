package com.bakeryquotation.backend.Participation;

import com.bakeryquotation.backend.Quotation.Quotation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, Long> {
    Optional<Participation> findByQuotation_IdAndSupplier_Id(Long quotationId, Long supplierId);

    List<Participation> findAllByQuotation_Id(Long quotationId);

    Page<Participation> findBySupplier_Id(Long supplierId, Pageable pageable);
}

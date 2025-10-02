package com.bakeryquotation.backend.Participation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, Long> {
    Optional<Participation> findByQuotation_IdAndSupplier_Id(Long quotationId, Long supplierId);
}

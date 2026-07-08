package com.bakeryquotation.backend.Participation;

import com.bakeryquotation.backend.Quotation.Quotation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, Long> {
    Optional<Participation> findByQuotation_IdAndSupplier_Id(Long quotationId, Long supplierId);

    List<Participation> findAllByQuotation_Id(Long quotationId);

    Page<Participation> findBySupplier_Id(Long supplierId, Pageable pageable);

    @Query("SELECT p FROM Participation p WHERE p.supplier.id = :supplierId AND (" +
           "(:value = 'agendado' AND p.quotation.quotationStart > :now) OR " +
           "(:value = 'ativo' AND p.quotation.quotationStart <= :now AND p.quotation.quotationEnd >= :now) OR " +
           "(:value = 'fechado' AND p.quotation.quotationEnd < :now))")
    Page<Participation> findBySupplierIdAndStatus(Long supplierId, String value, Instant now, Pageable pageable);
}

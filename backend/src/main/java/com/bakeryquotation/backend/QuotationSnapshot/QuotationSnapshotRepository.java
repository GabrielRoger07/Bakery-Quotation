package com.bakeryquotation.backend.QuotationSnapshot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuotationSnapshotRepository extends JpaRepository<QuotationSnapshot, Long> {

    List<QuotationSnapshot> findAllByQuotationId(Long quotationId);

    List<QuotationSnapshot> findAllByQuotationIdAndParticipationId(Long quotationId, Long participationId);

    boolean existsByQuotationId(Long quotationId);
}

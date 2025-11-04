package com.bakeryquotation.backend.Bid;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, BidId> {

    Optional<Bid> findTopByParticipation_IdAndProduct_IdOrderByPriceAsc(Long participationId, Long productId);

    List<Bid> findAllByParticipation_Quotation_Id(Long participationQuotationId);

    List<Bid> findAllByParticipation_Id(Long participationId);
}

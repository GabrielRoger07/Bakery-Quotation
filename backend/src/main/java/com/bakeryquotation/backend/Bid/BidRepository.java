package com.bakeryquotation.backend.Bid;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, BidId> {

    @Query(value = "SELECT b FROM Bid b WHERE b.participation.quotation.id = :quotationId AND b.product.id = :productId ORDER BY (b.price / (b.bonus + b.quantity)) ASC LIMIT 1")
    Optional<Bid> findLowestBid(@Param("quotationId") Long quotationId, @Param("productId") Long productId);

    List<Bid> findAllByParticipation_Quotation_Id(Long participationQuotationId);

    List<Bid> findAllByParticipation_Id(Long participationId);
}

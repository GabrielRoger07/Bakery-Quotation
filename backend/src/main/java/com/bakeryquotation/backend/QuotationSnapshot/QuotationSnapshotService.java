package com.bakeryquotation.backend.QuotationSnapshot;

import com.bakeryquotation.backend.Bid.Bid;
import com.bakeryquotation.backend.Bid.BidRepository;
import com.bakeryquotation.backend.Bid.BidService;
import com.bakeryquotation.backend.Contain.Contain;
import com.bakeryquotation.backend.Contain.ContainRepository;
import com.bakeryquotation.backend.Participation.ParticipationService;
import com.bakeryquotation.backend.Quotation.Quotation;
import com.bakeryquotation.backend.Quotation.QuotationRepository;
import com.bakeryquotation.backend.QuotationSnapshot.DTO.QuotationSnapshotResponseDTO;
import com.bakeryquotation.backend.exception.AccessDeniedException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class QuotationSnapshotService {

    private final QuotationSnapshotRepository snapshotRepository;
    private final QuotationRepository quotationRepository;
    private final ContainRepository containRepository;
    private final BidRepository bidRepository;
    private final ParticipationService participationService;

    public QuotationSnapshotService(
            QuotationSnapshotRepository snapshotRepository,
            QuotationRepository quotationRepository,
            ContainRepository containRepository,
            BidRepository bidRepository,
            ParticipationService participationService) {
        this.snapshotRepository = snapshotRepository;
        this.quotationRepository = quotationRepository;
        this.containRepository = containRepository;
        this.bidRepository = bidRepository;
        this.participationService = participationService;
    }

    public ResponseEntity<List<QuotationSnapshotResponseDTO>> getSnapshotByQuotationId(Long quotationId) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + quotationId + " does not exist"));

        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!companyEmail.equals(quotation.getCompany().getCompanyEmail())) {
            throw new AccessDeniedException("You do not have permission to perform this action. Nice try");
        }

        generateSnapshotIfClosed(quotation);

        List<QuotationSnapshot> snapshots = snapshotRepository.findAllByQuotationId(quotationId);
        return ResponseEntity.status(HttpStatus.OK).body(snapshots.stream().map(this::toDto).toList());
    }

    public ResponseEntity<List<QuotationSnapshotResponseDTO>> getSnapshotByQuotationIdAndParticipationId(
            Long quotationId, Long participationId) {

        participationService.validateSupplierOwnership(participationId);

        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + quotationId + " does not exist"));

        generateSnapshotIfClosed(quotation);

        List<QuotationSnapshot> snapshots = snapshotRepository
                .findAllByQuotationIdAndParticipationId(quotationId, participationId);
        return ResponseEntity.status(HttpStatus.OK).body(snapshots.stream().map(this::toDto).toList());
    }

    @Transactional
    private void generateSnapshotIfClosed(Quotation quotation) {
        if (quotation.getQuotationEnd().isAfter(LocalDateTime.now())) {
            return;
        }

        if (snapshotRepository.existsByQuotationId(quotation.getId())) {
            return;
        }

        List<Contain> contains = containRepository.findAllByQuotation_Id(quotation.getId());

        for (Contain contain : contains) {
            Long productId = contain.getProduct().getId();
            Optional<Bid> lowestBidOpt = bidRepository.findLowestBid(quotation.getId(), productId);

            if (lowestBidOpt.isEmpty()) continue;

            Bid bid = lowestBidOpt.get();
            BigDecimal totalQty = bid.getQuantity().add(bid.getBonus());
            BigDecimal pricePerUnit = BidService.numberFormat(bid.getPrice(), totalQty)
                    .setScale(4, RoundingMode.HALF_UP);

            QuotationSnapshot snapshot = new QuotationSnapshot();
            snapshot.setQuotationId(quotation.getId());
            snapshot.setProductId(productId);
            snapshot.setParticipationId(bid.getParticipation().getId());

            snapshot.setProductName(contain.getProduct().getProductName());
            snapshot.setProductDescription(contain.getProduct().getProductDescription());
            snapshot.setQuotedQuantity(contain.getQuantity());
            snapshot.setBrand(contain.getBrand());

            snapshot.setSupplierName(bid.getParticipation().getSupplier().getSupplierName());
            snapshot.setEmployerName(bid.getParticipation().getSupplier().getEmployerName());
            snapshot.setEmployerCnpj(bid.getParticipation().getSupplier().getEmployerCnpj());

            snapshot.setBidQuantity(bid.getQuantity());
            snapshot.setBonus(bid.getBonus());
            snapshot.setTotalPrice(bid.getPrice());
            snapshot.setPricePerUnit(pricePerUnit);

            snapshot.setCreatedAt(LocalDateTime.now());

            snapshotRepository.save(snapshot);
        }
    }

    private QuotationSnapshotResponseDTO toDto(QuotationSnapshot snapshot) {
        QuotationSnapshotResponseDTO dto = new QuotationSnapshotResponseDTO();
        dto.setSnapshotId(snapshot.getSnapshotId());
        dto.setQuotationId(snapshot.getQuotationId());
        dto.setProductId(snapshot.getProductId());
        dto.setParticipationId(snapshot.getParticipationId());
        dto.setProductName(snapshot.getProductName());
        dto.setProductDescription(snapshot.getProductDescription());
        dto.setQuotedQuantity(snapshot.getQuotedQuantity());
        dto.setBrand(snapshot.getBrand());
        dto.setSupplierName(snapshot.getSupplierName());
        dto.setEmployerName(snapshot.getEmployerName());
        dto.setEmployerCnpj(snapshot.getEmployerCnpj());
        dto.setBidQuantity(snapshot.getBidQuantity());
        dto.setBonus(snapshot.getBonus());
        dto.setTotalPrice(snapshot.getTotalPrice());
        dto.setPricePerUnit(snapshot.getPricePerUnit());
        dto.setCreatedAt(snapshot.getCreatedAt());
        return dto;
    }
}

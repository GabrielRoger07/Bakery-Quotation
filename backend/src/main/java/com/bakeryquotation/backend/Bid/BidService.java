package com.bakeryquotation.backend.Bid;

import com.bakeryquotation.backend.Bid.DTO.BidRequestDTO;
import com.bakeryquotation.backend.Bid.DTO.BidResponseDTO;
import com.bakeryquotation.backend.Bid.mapper.BidMapper;
import com.bakeryquotation.backend.Participation.Participation;
import com.bakeryquotation.backend.Participation.ParticipationRepository;
import com.bakeryquotation.backend.Participation.ParticipationService;
import com.bakeryquotation.backend.Product.Product;
import com.bakeryquotation.backend.Product.ProductRepository;
import com.bakeryquotation.backend.Quotation.QuotationRepository;
import com.bakeryquotation.backend.exception.BidAboveLowestException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BidService {

    private final BidRepository bidRepository;
    private final BidMapper bidMapper;
    private final ParticipationRepository participationRepository;
    private final ParticipationService participationService;
    private final ProductRepository productRepository;
    private final QuotationRepository quotationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public BidService(BidRepository bidRepository,
                      BidMapper bidMapper,
                      ParticipationRepository participationRepository,
                      ParticipationService participationService,
                      ProductRepository productRepository,
                      QuotationRepository quotationRepository,
                      SimpMessagingTemplate messagingTemplate){
        this.bidRepository = bidRepository;
        this.bidMapper = bidMapper;
        this.participationRepository = participationRepository;
        this.participationService = participationService;
        this.productRepository = productRepository;
        this.quotationRepository = quotationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public ResponseEntity<BidResponseDTO> getBidById(Long participationId, Long productId){
        participationService.validateSupplierOwnership(participationId);
        BidId bidId = new BidId(participationId, productId);
        Bid bid = bidRepository.findById(bidId).orElseThrow(() -> new ResourceNotFoundException("Bid with participationId " + participationId + " and productId " + productId + " does not exists"));

        return ResponseEntity.status(HttpStatus.OK).body(bidMapper.toDto(bid));
    }

    public ResponseEntity<List<BidResponseDTO>> getAllBids(){
        List<Bid> bids = bidRepository.findAll();
        List<BidResponseDTO> bidResponseDTOS = new ArrayList<>();

        bids.forEach(bid -> {
            bidResponseDTOS.add(bidMapper.toDto(bid));
        });
        return ResponseEntity.status(HttpStatus.OK).body(bidResponseDTOS);
    }

    public ResponseEntity<BidResponseDTO> getLowestBid(Long quotationId, Long productId){
        quotationRepository.findById(quotationId).orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + quotationId + " does not exists"));
        productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product with id " + productId + " does not exists"));

        Optional<Bid> lowestBid = bidRepository.findLowestBid(quotationId, productId);

        BidResponseDTO bidResponseDTO = null;
        if(lowestBid.isPresent()){
            bidResponseDTO = bidMapper.toDto(lowestBid.get());
        }
        return ResponseEntity.status(HttpStatus.OK).body(bidResponseDTO);
    }

    public ResponseEntity<List<BidResponseDTO>> getBidsByQuotationId(Long quotationId){
        List<Bid> bids = bidRepository.findAllByParticipation_Quotation_Id(quotationId);
        List<BidResponseDTO> bidResponseDTOS = bids.stream().map(bidMapper::toDto).toList();
        return ResponseEntity.status(HttpStatus.OK).body(bidResponseDTOS);
    }

    public ResponseEntity<List<BidResponseDTO>> getBidsByParticipationId(Long participationId){
        participationService.validateSupplierOwnership(participationId);
        List<Bid> bids = bidRepository.findAllByParticipation_Id(participationId);
        List<BidResponseDTO> bidResponseDTOS = bids.stream().map(bidMapper::toDto).toList();
        return ResponseEntity.status(HttpStatus.OK).body(bidResponseDTOS);
    }

    public ResponseEntity<BidResponseDTO> createBid(BidRequestDTO bidRequestDTO){
        Long participationId = bidRequestDTO.getParticipationId();
        Long productId = bidRequestDTO.getProductId();

        participationService.validateSupplierOwnership(participationId);
        Participation participation = participationRepository.findById(participationId).orElseThrow(() -> new ResourceNotFoundException("Participation with id " + participationId + " does not exists"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product with id " + productId + " does not exists"));

        BidResponseDTO actualLowestBid = getLowestBid(participation.getQuotation().getId(), productId).getBody();

        if(actualLowestBid != null){
            BigDecimal totalQuantityLowest = actualLowestBid.getQuantity().add(actualLowestBid.getBonus());
            BigDecimal totalQuantityRequest = bidRequestDTO.getQuantity().add(bidRequestDTO.getBonus());
            BigDecimal pricePerUnitLowest = numberFormat(actualLowestBid.getPrice(), totalQuantityLowest);
            BigDecimal pricePerUnitRequest = numberFormat(bidRequestDTO.getPrice(), totalQuantityRequest);

            if(pricePerUnitRequest.compareTo(pricePerUnitLowest) >= 0){
                throw new BidAboveLowestException("Bid must be lower than the lowest bid");
            }
        }

        BidId bidId = new BidId(participationId, productId, LocalDateTime.now());

        Bid bid = bidMapper.toEntity(bidRequestDTO);
        bid.setParticipation(participation);
        bid.setProduct(product);
        bid.setBidId(bidId);

        Bid bidCreated = bidRepository.save(bid);
        BidResponseDTO bidResponseDTO = bidMapper.toDto(bidCreated);

        String destination = "/topic/quotation/" + participation.getQuotation().getId();
        messagingTemplate.convertAndSend(destination, bidResponseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(bidResponseDTO);
    }

    @Transactional
    public ResponseEntity<List<BidResponseDTO>> createBids(List<BidRequestDTO> bidRequestDTOList) {
        List<BidResponseDTO> bidResponseDTOList = new ArrayList<>();
        LocalDateTime createdAt = LocalDateTime.now();

        bidRequestDTOList.forEach(bidRequestDTO -> {
            Long participationId = bidRequestDTO.getParticipationId();
            participationService.validateSupplierOwnership(participationId);
            Participation participation = participationRepository.findById(participationId).orElseThrow(() -> new ResourceNotFoundException("Participation with id " + participationId + " does not exists"));

            Long productId = bidRequestDTO.getProductId();
            Product product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product with id " + productId + " does not exists"));

            BidId bidId = new BidId(participationId, productId, createdAt);

            Bid bid = bidMapper.toEntity(bidRequestDTO);
            bid.setParticipation(participation);
            bid.setProduct(product);
            bid.setBidId(bidId);

            Bid bidCreated = bidRepository.save(bid);
            bidResponseDTOList.add(bidMapper.toDto(bidCreated));
        });
        return ResponseEntity.status(HttpStatus.OK).body(bidResponseDTOList);
    }

    public ResponseEntity<BidResponseDTO> deleteBidById(Long participationId, Long productId){
        BidId bidId = new BidId(participationId, productId);
        Bid bid = bidRepository.findById(bidId).orElseThrow(() -> new ResourceNotFoundException("Bid with participationId " + participationId + " and productId " + productId + " does not exists"));

        bidRepository.deleteById(bid.getBidId());
        return ResponseEntity.status(HttpStatus.OK).body(bidMapper.toDto(bid));
    }

    public ResponseEntity<List<BidResponseDTO>> deleteAllBids(){
        List<Bid> bids = bidRepository.findAll();
        List<BidResponseDTO> bidResponseDTOS = new ArrayList<>();

        bids.forEach(bid -> {
            bidResponseDTOS.add(bidMapper.toDto(bid));
        });

        bidRepository.deleteAll();
        return ResponseEntity.status(HttpStatus.OK).body(bidResponseDTOS);
    }

    public static BigDecimal numberFormat(BigDecimal value, BigDecimal totalQuantity){
        BigDecimal pricePerUnit = value.divide(totalQuantity, MathContext.DECIMAL128);
        int scale = pricePerUnit.stripTrailingZeros().scale();
        if(scale <= 2){
            return pricePerUnit.setScale(2, RoundingMode.UNNECESSARY);
        }else{
            return pricePerUnit.setScale(2, RoundingMode.HALF_UP);
        }
    }
}

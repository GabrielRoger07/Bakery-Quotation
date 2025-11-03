package com.bakeryquotation.backend.Bid;

import com.bakeryquotation.backend.Bid.DTO.BidRequestDTO;
import com.bakeryquotation.backend.Bid.DTO.BidResponseDTO;
import com.bakeryquotation.backend.Bid.mapper.BidMapper;
import com.bakeryquotation.backend.Participation.Participation;
import com.bakeryquotation.backend.Participation.ParticipationRepository;
import com.bakeryquotation.backend.Product.Product;
import com.bakeryquotation.backend.Product.ProductRepository;
import com.bakeryquotation.backend.exception.BidAboveLowestException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BidService {

    private final BidRepository bidRepository;
    private final BidMapper bidMapper;
    private final ParticipationRepository participationRepository;
    private final ProductRepository productRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public BidService(BidRepository bidRepository,
                      BidMapper bidMapper,
                      ParticipationRepository participationRepository,
                      ProductRepository productRepository,
                      SimpMessagingTemplate messagingTemplate){
        this.bidRepository = bidRepository;
        this.bidMapper = bidMapper;
        this.participationRepository = participationRepository;
        this.productRepository = productRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public ResponseEntity<BidResponseDTO> getBidById(Long participationId, Long productId){
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

    public ResponseEntity<BidResponseDTO> getLowestBid(Long participationId, Long productId){

        participationRepository.findById(participationId).orElseThrow(() -> new ResourceNotFoundException("Participation with id " + participationId + " does not exists"));
        productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product with id " + productId + " does not exists"));

        Optional<Bid> lowestBid = bidRepository.findTopByParticipation_IdAndProduct_IdOrderByPriceAsc(participationId, productId);

        BidResponseDTO bidResponseDTO = null;
        if(lowestBid.isPresent()){
            bidResponseDTO = bidMapper.toDto(lowestBid.get());
        }
        return ResponseEntity.status(HttpStatus.OK).body(bidResponseDTO);
    }

    public ResponseEntity<BidResponseDTO> createBid(BidRequestDTO bidRequestDTO){
        Long participationId = bidRequestDTO.getParticipationId();
        Long productId = bidRequestDTO.getProductId();

        Participation participation = participationRepository.findById(participationId).orElseThrow(() -> new ResourceNotFoundException("Participation with id " + participationId + " does not exists"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product with id " + productId + " does not exists"));

        BidResponseDTO actualLowestBid = getLowestBid(participationId, productId).getBody();

        if(actualLowestBid != null && bidRequestDTO.getPrice().compareTo(actualLowestBid.getPrice()) >= 0){
            throw new BidAboveLowestException("Bid must be lower than the lowest bid");
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
}

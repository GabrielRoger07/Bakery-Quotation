package com.bakeryquotation.backend.Bid;

import com.bakeryquotation.backend.Bid.DTO.BidRequestDTO;
import com.bakeryquotation.backend.Bid.DTO.BidResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bids")
public class BidController {

    private final BidService bidService;

    public BidController(BidService bidService){
        this.bidService = bidService;
    }

    @GetMapping("/{participationId}/{productId}")
    public ResponseEntity<BidResponseDTO> getBidById(@PathVariable("participationId") Long participationId, @PathVariable("productId") Long productId){
        return bidService.getBidById(participationId, productId);
    }

    @GetMapping
    public ResponseEntity<List<BidResponseDTO>> getAllBids(){
        return bidService.getAllBids();
    }

    @PostMapping
    public ResponseEntity<BidResponseDTO> createBid(@Valid @RequestBody BidRequestDTO bidRequestDTO){
        return bidService.createBid(bidRequestDTO);
    }

    @DeleteMapping("/{participationId}/{productId}")
    public ResponseEntity<BidResponseDTO> deleteBidById(@PathVariable("participationId") Long participationId, @PathVariable("productId") Long productId){
        return bidService.deleteBidById(participationId, productId);
    }

    @DeleteMapping
    public ResponseEntity<List<BidResponseDTO>> deleteAllBids(){
        return bidService.deleteAllBids();
    }

}

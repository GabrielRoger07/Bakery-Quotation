package com.bakeryquotation.backend.Participation;

import com.bakeryquotation.backend.Participation.DTO.AccessTokenRequestDTO;
import com.bakeryquotation.backend.Participation.DTO.ParticipationRequestDTO;
import com.bakeryquotation.backend.Participation.DTO.ParticipationResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/participations")
public class ParticipationController {

    private final ParticipationService participationService;

    public ParticipationController(ParticipationService participationService){
        this.participationService = participationService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParticipationResponseDTO> getParticipationById(@PathVariable("id") Long id){
        return participationService.getParticipationById(id);
    }

    @GetMapping
    public ResponseEntity<List<ParticipationResponseDTO>> getAllParticipations(){
        return participationService.getAllParticipations();
    }

    @GetMapping("/quotations/{quotationId}")
    public ResponseEntity<List<ParticipationResponseDTO>> getAllParticipationsByQuotationId(@PathVariable("quotationId") Long quotationId){
        return participationService.getAllParticipationsByQuotationId(quotationId);
    }

    @GetMapping("/{quotationId}/{supplierId}")
    public ResponseEntity<ParticipationResponseDTO> getParticipationByQuotationIdAndSupplierId(@PathVariable("quotationId") Long quotationId, @PathVariable("supplierId") Long supplierId){
        return participationService.getParticipationByQuotationIdAndSupplierId(quotationId, supplierId);
    }

    @PostMapping
    public ResponseEntity<ParticipationResponseDTO> createParticipation(@Valid @RequestBody ParticipationRequestDTO participationRequestDTO){
        return participationService.createParticipation(participationRequestDTO);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<ParticipationResponseDTO>> createParticipations(@Valid @RequestBody List<ParticipationRequestDTO> participationRequestDTOS){
        return participationService.createParticipations(participationRequestDTOS);
    }

    @PostMapping("/validateToken/{participationId}")
    public ResponseEntity<ParticipationResponseDTO> validateAccessToken(@PathVariable("participationId") Long participationId, @Valid @RequestBody AccessTokenRequestDTO accessToken){
        return participationService.validateAccessToken(participationId, accessToken);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ParticipationResponseDTO> deleteParticipationById(@PathVariable("id") Long id){
        return participationService.deleteParticipationById(id);
    }

    @DeleteMapping
    public ResponseEntity<List<ParticipationResponseDTO>> deleteAllParticipations(){
        return participationService.deleteAllParticipations();
    }
}

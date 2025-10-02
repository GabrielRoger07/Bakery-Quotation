package com.bakeryquotation.backend.Participation;

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

    @PostMapping
    public ResponseEntity<ParticipationResponseDTO> createParticipation(@Valid @RequestBody ParticipationRequestDTO participationRequestDTO){
        return participationService.createParticipation(participationRequestDTO);
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

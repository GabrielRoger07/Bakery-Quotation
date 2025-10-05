package com.bakeryquotation.backend.Contain;

import com.bakeryquotation.backend.Contain.DTO.ContainRequestDTO;
import com.bakeryquotation.backend.Contain.DTO.ContainResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/contains")
public class ContainController {

    private final ContainService containService;

    public ContainController(ContainService containService){
        this.containService = containService;
    }

    @GetMapping("/{quotationId}/{productId}")
    public ResponseEntity<ContainResponseDTO> getContainById(@PathVariable("quotationId") Long quotationId, @PathVariable("productId") Long productId){
        return containService.getContainById(quotationId, productId);
    }

    @GetMapping
    public ResponseEntity<List<ContainResponseDTO>> getAllContains(){
        return containService.getAllContains();
    }

    @PostMapping
    public ResponseEntity<ContainResponseDTO> createContain(@Valid @RequestBody ContainRequestDTO containRequestDTO){
        return containService.createContain(containRequestDTO);
    }

    @DeleteMapping("/{quotationId}/{productId}")
    public ResponseEntity<ContainResponseDTO> deleteContainById(@PathVariable("quotationId") Long quotationId, @PathVariable("productId") Long productId){
        return containService.deleteContainById(quotationId, productId);
    }
    @DeleteMapping
    public ResponseEntity<List<ContainResponseDTO>> deleteAllContains(){
        return containService.deleteAllContains();
    }
}

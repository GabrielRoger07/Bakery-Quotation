package com.bakeryquotation.backend.Participation;

import com.bakeryquotation.backend.Participation.DTO.ParticipationRequestDTO;
import com.bakeryquotation.backend.Participation.DTO.ParticipationResponseDTO;
import com.bakeryquotation.backend.Participation.DTO.SupplierParticipationResponseDTO;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/participations")
public class ParticipationController {

    private final ParticipationService participationService;
    private final SupplierReportService supplierReportService;

    public ParticipationController(ParticipationService participationService, SupplierReportService supplierReportService){
        this.participationService = participationService;
        this.supplierReportService = supplierReportService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParticipationResponseDTO> getParticipationById(@PathVariable("id") Long id){
        return participationService.getParticipationById(id);
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<byte[]> getSupplierReport(@PathVariable("id") Long id){
        byte[] pdf = supplierReportService.generateReport(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "lances-" + id + ".pdf");
        return ResponseEntity.status(HttpStatus.OK).headers(headers).body(pdf);
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

    @GetMapping("/supplier")
    public ResponseEntity<Page<SupplierParticipationResponseDTO>> getParticipationsBySupplierId(
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(value = "field", required = false) String field,
            @RequestParam(value = "value", required = false) String value
    ){
        return participationService.getParticipationsBySupplierId(pageable, field, value);
    }

    @PostMapping
    public ResponseEntity<ParticipationResponseDTO> createParticipation(@Valid @RequestBody ParticipationRequestDTO participationRequestDTO){
        return participationService.createParticipation(participationRequestDTO);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<ParticipationResponseDTO>> createParticipations(@Valid @RequestBody List<ParticipationRequestDTO> participationRequestDTOS){
        return participationService.createParticipations(participationRequestDTOS);
    }

    @PutMapping("/batch")
    public ResponseEntity<List<ParticipationResponseDTO>> updateParticipations(@Valid @RequestBody List<ParticipationRequestDTO> participationRequestDTOS){
        return participationService.updateParticipations(participationRequestDTOS);
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

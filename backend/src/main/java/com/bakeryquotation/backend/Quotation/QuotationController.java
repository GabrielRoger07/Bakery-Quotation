package com.bakeryquotation.backend.Quotation;

import com.bakeryquotation.backend.Quotation.DTO.QuotationRequestDTO;
import com.bakeryquotation.backend.Quotation.DTO.QuotationResponseDTO;
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
@RequestMapping("/api/v1/quotations")
public class QuotationController {

    private final QuotationService quotationService;
    private final QuotationReportService quotationReportService;

    public QuotationController(QuotationService quotationService, QuotationReportService quotationReportService){
        this.quotationService = quotationService;
        this.quotationReportService = quotationReportService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuotationResponseDTO> getQuotationById(@PathVariable("id") Long id){
        return quotationService.getQuotationById(id);
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<byte[]> getQuotationReport(@PathVariable("id") Long id){
        byte[] pdf = quotationReportService.generateReport(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "cotacao-" + id + ".pdf");
        return ResponseEntity.status(HttpStatus.OK).headers(headers).body(pdf);
    }

    @GetMapping
    public ResponseEntity<List<QuotationResponseDTO>> getAllQuotations(){
        return quotationService.getAllQuotations();
    }

    @GetMapping("/company")
    public ResponseEntity<Page<QuotationResponseDTO>> getQuotationsByCompanyEmail(
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(value = "field", required = false) String field,
            @RequestParam(value = "value", required = false) String value
    ){
        return quotationService.getQuotationsByCompanyEmail(pageable, field, value);
    }

    @PostMapping
    public ResponseEntity<QuotationResponseDTO> createQuotation(@Valid @RequestBody QuotationRequestDTO quotationRequestDTO){
        return quotationService.createQuotation(quotationRequestDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuotationResponseDTO> updateQuotationById(@Valid @RequestBody QuotationRequestDTO quotationRequestDTO, @PathVariable("id") Long id){
        return quotationService.updateQuotationById(quotationRequestDTO, id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<QuotationResponseDTO> deleteQuotationById(@PathVariable("id") Long id){
        return quotationService.deleteQuotationById(id);
    }

    @DeleteMapping
    public ResponseEntity<List<QuotationResponseDTO>> deleteAllQuotations(){
        return quotationService.deleteAllQuotations();
    }
}

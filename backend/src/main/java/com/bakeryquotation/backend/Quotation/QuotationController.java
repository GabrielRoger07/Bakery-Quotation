package com.bakeryquotation.backend.Quotation;

import com.bakeryquotation.backend.Quotation.DTO.QuotationResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quotations")
public class QuotationController {

    private final QuotationService quotationService;

    public QuotationController(QuotationService quotationService){
        this.quotationService = quotationService;
    }

    @GetMapping
    public ResponseEntity<List<QuotationResponseDTO>> getAllQuotations(){
        return quotationService.getAllQuotations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuotationResponseDTO> getQuotationById(@PathVariable("id") Long id){
        return quotationService.getQuotationById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<QuotationResponseDTO> deleteQuotationById(@PathVariable("id") Long id){
        return quotationService.deleteQuotationById(id);
    }
}

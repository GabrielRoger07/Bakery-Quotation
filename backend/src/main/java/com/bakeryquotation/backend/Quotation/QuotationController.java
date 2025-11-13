package com.bakeryquotation.backend.Quotation;

import com.bakeryquotation.backend.Quotation.DTO.QuotationRequestDTO;
import com.bakeryquotation.backend.Quotation.DTO.QuotationResponseDTO;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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

    @GetMapping("/{id}")
    public ResponseEntity<QuotationResponseDTO> getQuotationById(@PathVariable("id") Long id){
        return quotationService.getQuotationById(id);
    }

    @GetMapping
    public ResponseEntity<List<QuotationResponseDTO>> getAllQuotations(){
        return quotationService.getAllQuotations();
    }

    @GetMapping("/company/{companyCnpj}")
    public ResponseEntity<Page<QuotationResponseDTO>> getQuotationsByCompanyCnpj(@PathVariable("companyCnpj") String cnpj, @PageableDefault(size = 10) Pageable pageable){
        return quotationService.getQuotationsByCompanyCnpj(cnpj, pageable);
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

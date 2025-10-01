package com.bakeryquotation.backend.Quotation;

import com.bakeryquotation.backend.Quotation.mapper.QuotationMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final QuotationMapper quotationMapper;

    public QuotationService(QuotationRepository quotationRepository, QuotationMapper quotationMapper){
        this.quotationRepository = quotationRepository;
        this.quotationMapper = quotationMapper;
    }

    public ResponseEntity<List<QuotationResponseDTO>> getAllQuotations(){
        List<Quotation> quotations = quotationRepository.findAll();
        List<QuotationResponseDTO> quotationResponseDTOS = new ArrayList<>();
        quotations.forEach(quotation -> {
            quotationResponseDTOS.add(quotationMapper.toDto(quotation));
        });
        return ResponseEntity.status(HttpStatus.OK).body(quotationResponseDTOS);
    }

    public ResponseEntity<QuotationResponseDTO> getQuotationById(Long id){
        Quotation quotation = quotationRepository.findById(id).orElseThrow(() -> new RuntimeException("Quotation with id " + id + " does not exists"));
        return ResponseEntity.status(HttpStatus.OK).body(quotationMapper.toDto(quotation));
    }

    public ResponseEntity<QuotationResponseDTO> deleteQuotationById(Long id){
        Quotation quotation = quotationRepository.findById(id).orElseThrow(() -> new RuntimeException("Quotation with id " + id + "does not exists"));
        quotationRepository.delete(quotation);
        return ResponseEntity.status(HttpStatus.OK).body(quotationMapper.toDto(quotation));
    }
}

package com.bakeryquotation.backend.Quotation;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Quotation.DTO.QuotationRequestDTO;
import com.bakeryquotation.backend.Quotation.DTO.QuotationResponseDTO;
import com.bakeryquotation.backend.Quotation.mapper.QuotationMapper;
import com.bakeryquotation.backend.Supplier.DTO.SupplierResponseDTO;
import com.bakeryquotation.backend.exception.ImmutableResourceException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final QuotationMapper quotationMapper;
    private final CompanyRepository companyRepository;

    public QuotationService(QuotationRepository quotationRepository, QuotationMapper quotationMapper, CompanyRepository companyRepository){
        this.quotationRepository = quotationRepository;
        this.quotationMapper = quotationMapper;
        this.companyRepository = companyRepository;
    }

    public ResponseEntity<QuotationResponseDTO> getQuotationById(Long id){
        Quotation quotation = quotationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + id + " does not exists"));
        return ResponseEntity.status(HttpStatus.OK).body(quotationMapper.toDto(quotation));
    }

    public ResponseEntity<List<QuotationResponseDTO>> getAllQuotations(){
        List<Quotation> quotations = quotationRepository.findAll();
        List<QuotationResponseDTO> quotationResponseDTOS = new ArrayList<>();
        quotations.forEach(quotation -> {
            quotationResponseDTOS.add(quotationMapper.toDto(quotation));
        });
        return ResponseEntity.status(HttpStatus.OK).body(quotationResponseDTOS);
    }

    public ResponseEntity<QuotationResponseDTO> createQuotation(QuotationRequestDTO quotationRequestDTO){
        String companyCnpj = quotationRequestDTO.getCompanyCnpj();
        Company company = companyRepository.findById(companyCnpj).orElseThrow(() -> new ResourceNotFoundException("Company with CNPJ " + companyCnpj + " does not exists"));

        Quotation quotation = quotationMapper.toEntity(quotationRequestDTO);
        quotation.setCompany(company);

        QuotationResponseDTO quotationCreated = quotationMapper.toDto(quotationRepository.save(quotation));
        return ResponseEntity.status(HttpStatus.CREATED).body(quotationCreated);
    }

    public ResponseEntity<QuotationResponseDTO> updateQuotationById(QuotationRequestDTO quotationRequestDTO, Long id){
        Quotation quotation = quotationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + id + " does not exists"));
        String companyCnpj = quotationRequestDTO.getCompanyCnpj();

        if(!quotation.getCompany().getCompanyCnpj().equals(companyCnpj)){
            throw new ImmutableResourceException("CNPJ cannot be changed");
        }

        quotation.setQuotationStart(quotationRequestDTO.getQuotationStart());
        quotation.setQuotationEnd(quotationRequestDTO.getQuotationEnd());

        QuotationResponseDTO quotationSaved = quotationMapper.toDto(quotationRepository.save(quotation));
        return ResponseEntity.status(HttpStatus.CREATED).body(quotationSaved);
    }

    public ResponseEntity<QuotationResponseDTO> deleteQuotationById(Long id){
        Quotation quotation = quotationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + id + "does not exists"));
        quotationRepository.delete(quotation);
        return ResponseEntity.status(HttpStatus.OK).body(quotationMapper.toDto(quotation));
    }

    public ResponseEntity<List<QuotationResponseDTO>> deleteAllQuotations(){
        List<Quotation> quotations = quotationRepository.findAll();
        List<QuotationResponseDTO> quotationResponseDTOS = new ArrayList<>();

        quotations.forEach(quotation -> {
            quotationResponseDTOS.add(quotationMapper.toDto(quotation));
        });
        quotationRepository.deleteAll();
        return ResponseEntity.status(HttpStatus.OK).body(quotationResponseDTOS);
    }
}

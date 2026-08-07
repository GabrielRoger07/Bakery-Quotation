package com.bakeryquotation.backend.Quotation;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Product.ProductService;
import com.bakeryquotation.backend.Quotation.DTO.QuotationRequestDTO;
import com.bakeryquotation.backend.Quotation.DTO.QuotationResponseDTO;
import com.bakeryquotation.backend.Quotation.mapper.QuotationMapper;
import com.bakeryquotation.backend.exception.AccessDeniedException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class QuotationService {

    @Value("${app.pagination-size}")
    private int pageSize;

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

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

    public ResponseEntity<Page<QuotationResponseDTO>> getQuotationsByCompanyEmail(Pageable pageable, String field, String value){
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Pageable safePageable = PageRequest.of(pageable.getPageNumber(), pageSize, pageable.getSort());
        Page<Quotation> quotationsByCompany;

        log.info("-----------------------");
        log.info("field: {}", field);
        log.info("value: {}", value);

        boolean applyFilter = field != null && value != null && !value.isBlank();

        log.info("applyFilter value: {}", applyFilter);

        if(applyFilter){
            if(field.equals("status")){
                quotationsByCompany = quotationRepository.findByCompanyEmailAndStatus(companyEmail, value, Instant.now(), safePageable);
                System.out.println(quotationsByCompany);
                log.info("quotationsByCompany size: {}", quotationsByCompany.getTotalElements());
            } else {
                throw new ResourceNotFoundException("Invalid field");
            }
        } else {
            quotationsByCompany = quotationRepository.findByCompany_CompanyEmail(companyEmail, safePageable);
        }

        Page<QuotationResponseDTO> quotationsResponseDTOByCompany = quotationsByCompany.map(quotationMapper::toDto);
        return ResponseEntity.status(HttpStatus.OK).body(quotationsResponseDTOByCompany);
    }

    public ResponseEntity<QuotationResponseDTO> createQuotation(QuotationRequestDTO quotationRequestDTO){
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Company company = companyRepository.findByCompanyEmail(companyEmail).orElseThrow(() -> new ResourceNotFoundException("Company with email " + companyEmail + " does not exists"));
        Quotation quotation = quotationMapper.toEntity(quotationRequestDTO);
        quotation.setCompany(company);

        QuotationResponseDTO quotationCreated = quotationMapper.toDto(quotationRepository.save(quotation));
        return ResponseEntity.status(HttpStatus.CREATED).body(quotationCreated);
    }

    public ResponseEntity<QuotationResponseDTO> updateQuotationById(QuotationRequestDTO quotationRequestDTO, Long id){
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Quotation quotation = quotationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + id + " does not exists"));

        if(!companyEmail.equals(quotation.getCompany().getCompanyEmail())) {
            throw new AccessDeniedException("You do not have permission to perform this action. Nice try");
        }

        quotation.setQuotationStart(quotationRequestDTO.getQuotationStart());
        quotation.setQuotationEnd(quotationRequestDTO.getQuotationEnd());
        quotation.setIsAuction(quotationRequestDTO.getIsAuction());
        QuotationResponseDTO quotationUpdated = quotationMapper.toDto(quotationRepository.save(quotation));
        return ResponseEntity.status(HttpStatus.CREATED).body(quotationUpdated);
    }

    public ResponseEntity<QuotationResponseDTO> deleteQuotationById(Long id){
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Quotation quotation = quotationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + id + " does not exists"));
        if(!companyEmail.equals(quotation.getCompany().getCompanyEmail())) {
            throw new AccessDeniedException("You do not have permission to perform this action. Nice try");
        }
        quotationRepository.delete(quotation);
        return ResponseEntity.status(HttpStatus.OK).body(quotationMapper.toDto(quotation));
    }

    public ResponseEntity<List<QuotationResponseDTO>> deleteAllQuotations(){
        List<Quotation> quotations = quotationRepository.findAll();
        List<QuotationResponseDTO> quotationResponseDTOS = new ArrayList<>();

        if(!quotations.isEmpty()) {
            quotations.forEach(quotation -> {
                quotationResponseDTOS.add(quotationMapper.toDto(quotation));
            });
            quotationRepository.deleteAll();
        }
        return ResponseEntity.status(HttpStatus.OK).body(quotationResponseDTOS);
    }
}

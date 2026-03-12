package com.bakeryquotation.backend.Supplier;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Supplier.DTO.SupplierRequestDTO;
import com.bakeryquotation.backend.Supplier.DTO.SupplierResponseDTO;
import com.bakeryquotation.backend.Supplier.mapper.SupplierMapper;
import com.bakeryquotation.backend.exception.AccessDeniedException;
import com.bakeryquotation.backend.exception.DuplicateResourceException;
import com.bakeryquotation.backend.exception.ImmutableResourceException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SupplierService {

    @Value("${app.pagination-size}")
    private int pageSize;

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;
    private final CompanyRepository companyRepository;

    public SupplierService(SupplierRepository supplierRepository, SupplierMapper supplierMapper, CompanyRepository companyRepository){
        this.supplierRepository = supplierRepository;
        this.supplierMapper = supplierMapper;
        this.companyRepository = companyRepository;
    }

    public ResponseEntity<SupplierResponseDTO> getSupplierById(Long id){
        Supplier supplier = supplierRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Supplier with id " + id + " does not exists"));
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if(!email.equals(supplier.getCompany().getCompanyEmail())) {
            throw new AccessDeniedException("You do not have permission to perform this action. Nice try");
        }
        return ResponseEntity.status(HttpStatus.OK).body(supplierMapper.toDto(supplier));
    }

    public ResponseEntity<List<SupplierResponseDTO>> getAllSuppliers(){
        List<Supplier> suppliers = supplierRepository.findAll();
        List<SupplierResponseDTO> supplierResponseDTOS = new ArrayList<>();
        if(!suppliers.isEmpty()) {
            suppliers.forEach(supplier -> {
                supplierResponseDTOS.add(supplierMapper.toDto(supplier));
            });
        }
        return ResponseEntity.status(HttpStatus.OK).body(supplierResponseDTOS);
    }

    public ResponseEntity<Page<SupplierResponseDTO>> getSuppliersByCompanyEmail(Pageable pageable, String field, String value, List<Long> excludedIds){
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Pageable safePageable = PageRequest.of(pageable.getPageNumber(), pageSize, pageable.getSort());
        Page<Supplier> suppliersByCompany;

        boolean applyFilter = field != null && value != null && !value.isBlank();
        boolean hasExcludedIds = excludedIds != null && !excludedIds.isEmpty();

        if(applyFilter){
            if(field.equals("employerCnpj")){
                if(hasExcludedIds){
                    suppliersByCompany = supplierRepository.findByCompanyEmailAndEmployerCnpjExcludingIds(companyEmail, value, excludedIds, safePageable);
                } else {
                    suppliersByCompany = supplierRepository.findByCompany_CompanyEmailAndEmployerCnpjContainsIgnoreCase(companyEmail, value, safePageable);
                }
            } else if(field.equals("employerName")){
                if(hasExcludedIds){
                    suppliersByCompany = supplierRepository.findByCompanyEmailAndEmployerNameExcludingIds(companyEmail, value, excludedIds, safePageable);
                } else {
                    suppliersByCompany = supplierRepository.findByCompany_CompanyEmailAndEmployerNameContainingIgnoreCase(companyEmail, value, safePageable);
                }
            } else if(field.equals("supplierWhatsappNumber")){
                if(hasExcludedIds){
                    suppliersByCompany = supplierRepository.findByCompanyEmailAndWhatsappExcludingIds(companyEmail, value, excludedIds, safePageable);
                } else {
                    suppliersByCompany = supplierRepository.findByCompany_CompanyEmailAndSupplierWhatsappNumberContainingIgnoreCase(companyEmail, value, safePageable);
                }
            } else if(field.equals("supplierName")){
                if(hasExcludedIds){
                    suppliersByCompany = supplierRepository.findByCompanyEmailAndSupplierNameExcludingIds(companyEmail, value, excludedIds, safePageable);
                } else {
                    suppliersByCompany = supplierRepository.findByCompany_CompanyEmailAndSupplierNameContainingIgnoreCase(companyEmail, value, safePageable);
                }
            } else if(field.equals("supplierEmail")){
                if(hasExcludedIds){
                    suppliersByCompany = supplierRepository.findByCompanyEmailAndEmailExcludingIds(companyEmail, value, excludedIds, safePageable);
                } else {
                    suppliersByCompany = supplierRepository.findByCompany_CompanyEmailAndSupplierEmailContainingIgnoreCase(companyEmail, value, safePageable);
                }
            } else {
                throw new ResourceNotFoundException("Invalid field");
            }
        } else {
            if(hasExcludedIds){
                suppliersByCompany = supplierRepository.findByCompanyEmailExcludingIds(companyEmail, excludedIds, safePageable);
            } else {
                suppliersByCompany = supplierRepository.findByCompany_CompanyEmail(companyEmail, safePageable);
            }
        }

        Page<SupplierResponseDTO> suppliersResponseDTOByCompany = suppliersByCompany.map(supplierMapper::toDto);
        return ResponseEntity.status(HttpStatus.OK).body(suppliersResponseDTOByCompany);
    }

    public ResponseEntity<SupplierResponseDTO> createSupplier(SupplierRequestDTO supplierRequestDTO){
        Company company = (Company) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        validation(supplierRequestDTO);

        Supplier supplier = supplierMapper.toEntity(supplierRequestDTO);
        supplier.setCompany(company);

        Supplier supplierSaved = supplierRepository.save(supplier);
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierMapper.toDto(supplierSaved));
    }

    public ResponseEntity<SupplierResponseDTO> updateSupplierById(SupplierRequestDTO supplierRequestDTO, Long id){
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Supplier supplier = supplierRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Supplier with id " + id + " does not exists"));
        if(!companyEmail.equals(supplier.getCompany().getCompanyEmail())) {
            throw new AccessDeniedException("You do not have permission to perform this action. Nice try");
        }

        String supplierEmail = supplierRequestDTO.getSupplierEmail();
        String supplierWhatsappNumber = supplierRequestDTO.getSupplierWhatsappNumber();

        Optional<Supplier> exists = Optional.empty();

        if(supplierEmail != null) {
            exists = supplierRepository.findByCompany_CompanyEmailAndSupplierEmail(companyEmail, supplierEmail);
            if(exists.isPresent() && !exists.get().getId().equals(id)){
                throw new DuplicateResourceException("This company already has a supplier with email " + supplierEmail);
            }
        }

        exists = supplierRepository.findByCompany_CompanyEmailAndSupplierWhatsappNumber(companyEmail, supplierWhatsappNumber);
        if(exists.isPresent() && !exists.get().getId().equals(id)){
            throw new DuplicateResourceException("This company already has a supplier with Whatsapp number " + supplierWhatsappNumber);
        }

        supplier.setSupplierEmail(supplierRequestDTO.getSupplierEmail());
        supplier.setSupplierWhatsappNumber(supplierRequestDTO.getSupplierWhatsappNumber());
        supplier.setSupplierName(supplierRequestDTO.getSupplierName());
        supplier.setEmployerCnpj(supplierRequestDTO.getEmployerCnpj());
        supplier.setEmployerName(supplierRequestDTO.getEmployerName());

        SupplierResponseDTO supplierSaved = supplierMapper.toDto(supplierRepository.save(supplier));
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierSaved);
    }

    public ResponseEntity<SupplierResponseDTO> deleteSupplierById(Long id){
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Supplier supplier = supplierRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Supplier with id " + id + " does not exists"));
        if(!companyEmail.equals(supplier.getCompany().getCompanyEmail())) {
            throw new AccessDeniedException("You do not have permission to perform this action. Nice try");
        }
        supplierRepository.delete(supplier);
        return ResponseEntity.status(HttpStatus.OK).body(supplierMapper.toDto(supplier));
    }

    public ResponseEntity<List<SupplierResponseDTO>> deleteAllSuppliers(){
        List<Supplier> suppliers = supplierRepository.findAll();
        List<SupplierResponseDTO> supplierResponseDTOS = new ArrayList<>();
        if(!suppliers.isEmpty()) {
            suppliers.forEach(supplier -> {
                supplierResponseDTOS.add(supplierMapper.toDto(supplier));
            });
            supplierRepository.deleteAll();
        }
        return ResponseEntity.status(HttpStatus.OK).body(supplierResponseDTOS);
    }

    public void validation(SupplierRequestDTO supplierRequestDTO){
        String supplierEmail = supplierRequestDTO.getSupplierEmail();
        String supplierWhatsappNumber = supplierRequestDTO.getSupplierWhatsappNumber();
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        Optional<Supplier> exists = Optional.empty();

        if(supplierEmail != null) {
            exists = supplierRepository.findByCompany_CompanyEmailAndSupplierEmail(companyEmail, supplierEmail);
            if(exists.isPresent()){
                throw new DuplicateResourceException("This company already has a supplier with email " + supplierEmail);
            }
        }

        exists = supplierRepository.findByCompany_CompanyEmailAndSupplierWhatsappNumber(companyEmail, supplierWhatsappNumber);
        if(exists.isPresent()){
            throw new DuplicateResourceException("This company already has a supplier with Whatsapp number " + supplierWhatsappNumber);
        }
    }
}
package com.bakeryquotation.backend.Supplier;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Product.DTO.ProductResponseDTO;
import com.bakeryquotation.backend.Product.Product;
import com.bakeryquotation.backend.Supplier.DTO.SupplierRequestDTO;
import com.bakeryquotation.backend.Supplier.DTO.SupplierResponseDTO;
import com.bakeryquotation.backend.Supplier.mapper.SupplierMapper;
import com.bakeryquotation.backend.exception.DuplicateResourceException;
import com.bakeryquotation.backend.exception.ImmutableResourceException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SupplierService {

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
        return ResponseEntity.status(HttpStatus.OK).body(supplierMapper.toDto(supplier));
    }

    public ResponseEntity<List<SupplierResponseDTO>> getAllSuppliers(){
        List<Supplier> suppliers = supplierRepository.findAll();
        List<SupplierResponseDTO> supplierResponseDTOS = new ArrayList<>();
        suppliers.forEach(supplier -> {
            supplierResponseDTOS.add(supplierMapper.toDto(supplier));
        });
        return ResponseEntity.status(HttpStatus.OK).body(supplierResponseDTOS);
    }

    public ResponseEntity<SupplierResponseDTO> createSupplier(SupplierRequestDTO supplierRequestDTO){
        String companyCnpj = supplierRequestDTO.getCompanyCnpj();
        Company company = companyRepository.findById(companyCnpj).orElseThrow(() -> new ResourceNotFoundException("Company with CNPJ " + companyCnpj + " does not exists"));

        validation(supplierRequestDTO);

        Supplier supplier = supplierMapper.toEntity(supplierRequestDTO);
        supplier.setCompany(company);

        Supplier supplierSaved = supplierRepository.save(supplier);
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierMapper.toDto(supplierSaved));
    }

    public ResponseEntity<SupplierResponseDTO> updateSupplierById(SupplierRequestDTO supplierRequestDTO, Long id){
        Supplier supplier = supplierRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Supplier with id " + id + " does not exists"));

        String companyCnpj = supplierRequestDTO.getCompanyCnpj();
        if(!supplier.getCompany().getCompanyCnpj().equals(companyCnpj)){
            throw new ImmutableResourceException("CNPJ cannot be changed");
        }

        validation(supplierRequestDTO);

        supplier.setSupplierEmail(supplierRequestDTO.getSupplierEmail());
        supplier.setSupplierWhatsappNumber(supplierRequestDTO.getSupplierWhatsappNumber());
        supplier.setSupplierName(supplierRequestDTO.getSupplierName());
        supplier.setEmployerCnpj(supplierRequestDTO.getEmployerCnpj());
        supplier.setEmployerName(supplierRequestDTO.getEmployerName());

        SupplierResponseDTO supplierSaved = supplierMapper.toDto(supplierRepository.save(supplier));
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierSaved);
    }

    public ResponseEntity<SupplierResponseDTO> deleteSupplierById(Long id){
        Supplier supplier = supplierRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Supplier with id " + id + " does not exists"));
        supplierRepository.delete(supplier);
        return ResponseEntity.status(HttpStatus.OK).body(supplierMapper.toDto(supplier));
    }

    public ResponseEntity<List<SupplierResponseDTO>> deleteAllSuppliers(){
        List<Supplier> suppliers = supplierRepository.findAll();
        List<SupplierResponseDTO> supplierResponseDTOS = new ArrayList<>();
        suppliers.forEach(supplier -> {
            supplierResponseDTOS.add(supplierMapper.toDto(supplier));
        });
        supplierRepository.deleteAll();
        return ResponseEntity.status(HttpStatus.OK).body(supplierResponseDTOS);
    }

    public void validation(SupplierRequestDTO supplierRequestDTO){
        String supplierEmail = supplierRequestDTO.getSupplierEmail();
        String supplierWhatsappNumber = supplierRequestDTO.getSupplierWhatsappNumber();
        String companyCnpj = supplierRequestDTO.getCompanyCnpj();

        Optional<Supplier> exists = supplierRepository.findByCompany_CompanyCnpjAndSupplierEmail(companyCnpj, supplierEmail);
        if(exists.isPresent()){
            throw new DuplicateResourceException("This company already has a supplier with email " + supplierEmail);
        }

        exists = supplierRepository.findByCompany_CompanyCnpjAndSupplierWhatsappNumber(companyCnpj, supplierWhatsappNumber);
        if(exists.isPresent()){
            throw new DuplicateResourceException("This company already has a supplier with Whatsapp number " + supplierWhatsappNumber);
        }
    }
}
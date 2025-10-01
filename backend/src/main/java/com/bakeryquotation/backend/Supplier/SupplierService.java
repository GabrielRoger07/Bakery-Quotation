package com.bakeryquotation.backend.Supplier;

import com.bakeryquotation.backend.Supplier.DTO.SupplierResponseDTO;
import com.bakeryquotation.backend.Supplier.mapper.SupplierMapper;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    public SupplierService(SupplierRepository supplierRepository, SupplierMapper supplierMapper){
        this.supplierRepository = supplierRepository;
        this.supplierMapper = supplierMapper;
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

    public ResponseEntity<SupplierResponseDTO> deleteSupplierById(Long id){
        Supplier supplier = supplierRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Supplier with id " + id + " does not exists"));
        supplierRepository.delete(supplier);
        return ResponseEntity.status(HttpStatus.OK).body(supplierMapper.toDto(supplier));
    }
}

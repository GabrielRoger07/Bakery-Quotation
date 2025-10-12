package com.bakeryquotation.backend.Supplier;

import com.bakeryquotation.backend.Supplier.DTO.SupplierRequestDTO;
import com.bakeryquotation.backend.Supplier.DTO.SupplierResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService){
        this.supplierService = supplierService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> getSupplierById(@PathVariable("id") Long id){
        return supplierService.getSupplierById(id);
    }

    @GetMapping
    public ResponseEntity<List<SupplierResponseDTO>> getAllSuppliers(){
        return supplierService.getAllSuppliers();
    }

    @GetMapping("/company/{companyCnpj}")
    public ResponseEntity<List<SupplierResponseDTO>> getSuppliersByCompanyCnpj(@PathVariable("companyCnpj") String cnpj){
        return supplierService.getSuppliersByCompanyCnpj(cnpj);
    }

    @PostMapping
    public ResponseEntity<SupplierResponseDTO> createSupplier(@Valid @RequestBody SupplierRequestDTO supplierRequestDTO){
        return supplierService.createSupplier(supplierRequestDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> updateSupplierById(@Valid @RequestBody SupplierRequestDTO supplierRequestDTO, @PathVariable("id") Long id){
        return supplierService.updateSupplierById(supplierRequestDTO, id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> deleteSupplierById(@PathVariable("id") Long id){
        return supplierService.deleteSupplierById(id);
    }

    @DeleteMapping
    public ResponseEntity<List<SupplierResponseDTO>> deleteAllSuppliers(){
        return supplierService.deleteAllSuppliers();
    }

}

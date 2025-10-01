package com.bakeryquotation.backend.Supplier;

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

    @DeleteMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> deleteSupplierById(@PathVariable("id") Long id){
        return supplierService.deleteSupplierById(id);
    }

}

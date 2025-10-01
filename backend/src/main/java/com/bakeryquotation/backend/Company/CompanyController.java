package com.bakeryquotation.backend.Company;

import com.bakeryquotation.backend.Company.DTO.CompanyRequestDTO;
import com.bakeryquotation.backend.Company.DTO.CompanyResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService){
        this.companyService = companyService;
    }

    @PostMapping
    public ResponseEntity<CompanyResponseDTO> createCompany(@Valid @RequestBody CompanyRequestDTO companyRequestDTO){
        return companyService.createCompany(companyRequestDTO);
    }

    @GetMapping("/{cnpj}")
    public ResponseEntity<CompanyResponseDTO> getCompanyByCnpj(@PathVariable("cnpj") String cnpj){
        return companyService.getCompanyByCnpj(cnpj);
    }

    @GetMapping
    public ResponseEntity<List<CompanyResponseDTO>> getAllCompanies(){
        return companyService.getAllCompanies();
    }

    @DeleteMapping("/{cnpj}")
    public ResponseEntity<CompanyResponseDTO> deleteCompanyByCnpj(@PathVariable("cnpj") String cnpj){
        return companyService.deleteCompanyByCnpj(cnpj);
    }

    @PutMapping("/{cnpj}")
    public ResponseEntity<CompanyResponseDTO> updateCompanyByCnpj(@RequestBody CompanyRequestDTO companyRequestDTO, @PathVariable("cnpj") String cnpj){
        return companyService.updateCompanyByCnpj(companyRequestDTO, cnpj);
    }
}

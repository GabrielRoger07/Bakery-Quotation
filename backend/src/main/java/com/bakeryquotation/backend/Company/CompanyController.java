package com.bakeryquotation.backend.Company;

import com.bakeryquotation.backend.Company.DTO.CompanyRequestDTO;
import com.bakeryquotation.backend.Company.DTO.CompanyResponseDTO;
import com.bakeryquotation.backend.Company.DTO.Login.LoginRequestDTO;
import com.bakeryquotation.backend.Company.DTO.Login.LoginResponseDTO;
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

    @GetMapping("/{cnpj}")
    public ResponseEntity<CompanyResponseDTO> getCompanyByCnpj(@PathVariable("cnpj") String cnpj){
        return companyService.getCompanyByCnpj(cnpj);
    }

    @GetMapping
    public ResponseEntity<List<CompanyResponseDTO>> getAllCompanies(){
        return companyService.getAllCompanies();
    }

    @PostMapping("/register")
    public ResponseEntity<CompanyResponseDTO> createCompany(@Valid @RequestBody CompanyRequestDTO companyRequestDTO){
        return companyService.createCompany(companyRequestDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> loginCompany(@Valid @RequestBody LoginRequestDTO loginRequestDTO){
        return companyService.loginCompany(loginRequestDTO);
    }

    @PutMapping("/{cnpj}")
    public ResponseEntity<CompanyResponseDTO> updateCompanyByCnpj(@Valid @RequestBody CompanyRequestDTO companyRequestDTO, @PathVariable("cnpj") String cnpj){
        return companyService.updateCompanyByCnpj(companyRequestDTO, cnpj);
    }

    @DeleteMapping("/{cnpj}")
    public ResponseEntity<CompanyResponseDTO> deleteCompanyByCnpj(@PathVariable("cnpj") String cnpj){
        return companyService.deleteCompanyByCnpj(cnpj);
    }

    @DeleteMapping
    public ResponseEntity<List<CompanyResponseDTO>> deleteAllCompanies(){
        return companyService.deleteAllCompanies();
    }
}

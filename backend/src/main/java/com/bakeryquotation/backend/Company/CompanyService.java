package com.bakeryquotation.backend.Company;

import com.bakeryquotation.backend.Company.DTO.CompanyRequestDTO;
import com.bakeryquotation.backend.Company.DTO.CompanyResponseDTO;
import com.bakeryquotation.backend.Company.mapper.CompanyMapper;
import com.bakeryquotation.backend.Company.mapper.CompanyUpdate;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;
    private final CompanyUpdate companyUpdate;

    public CompanyService(CompanyRepository companyRepository, CompanyMapper companyMapper, CompanyUpdate companyUpdate){
        this.companyRepository = companyRepository;
        this.companyMapper = companyMapper;
        this.companyUpdate = companyUpdate;
    }

    public ResponseEntity<CompanyResponseDTO> createCompany(CompanyRequestDTO companyRequestDTO){
        Company company = companyMapper.toEntity(companyRequestDTO);
        CompanyResponseDTO companyResponseDTO = companyMapper.toDto(companyRepository.save(company));
        return ResponseEntity.status(HttpStatus.CREATED).body(companyResponseDTO);
    }

    public ResponseEntity<CompanyResponseDTO> getCompanyByCnpj(String cnpj){
        Company company = companyRepository.findById(cnpj).orElseThrow(() -> new ResourceNotFoundException("Company with cnpj " + cnpj + " does not exists"));
        return ResponseEntity.status(HttpStatus.OK).body(companyMapper.toDto(company));
    }

    public ResponseEntity<List<CompanyResponseDTO>> getAllCompanies(){
        List<Company> companies = companyRepository.findAll();
        List<CompanyResponseDTO> companiesResponseDto = new ArrayList<>();
        companies.forEach(company -> {
            companiesResponseDto.add(companyMapper.toDto(company));
        });
        return ResponseEntity.status(HttpStatus.OK).body(companiesResponseDto);
    }

    public ResponseEntity<CompanyResponseDTO> deleteCompanyByCnpj(String cnpj){
        Company company = companyRepository.findById(cnpj).orElseThrow(() -> new ResourceNotFoundException("Company with cnpj " + cnpj + " does not exists"));
        companyRepository.delete(company);
        return ResponseEntity.status(HttpStatus.OK).body(companyMapper.toDto(company));
    }

    public ResponseEntity<CompanyResponseDTO> updateCompanyByCnpj(CompanyRequestDTO companyRequestDTO, String cnpj){
        Company company = companyRepository.findById(cnpj).orElseThrow(() -> new ResourceNotFoundException("Company with cnpj " + cnpj + " does not exists"));
        companyUpdate.updateCompany(companyRequestDTO, company);
        CompanyResponseDTO companyResponseDTO = companyMapper.toDto(companyRepository.save(company));
        return ResponseEntity.status(HttpStatus.CREATED).body(companyResponseDTO);
    }
}

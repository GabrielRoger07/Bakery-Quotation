package com.bakeryquotation.backend.Company;

import com.bakeryquotation.backend.Company.DTO.CompanyRequestDTO;
import com.bakeryquotation.backend.Company.DTO.CompanyResponseDTO;
import com.bakeryquotation.backend.Company.mapper.CompanyMapper;
import com.bakeryquotation.backend.Company.mapper.CompanyUpdate;
import com.bakeryquotation.backend.exception.DuplicateResourceException;
import com.bakeryquotation.backend.exception.ImmutableResourceException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;
    private final CompanyUpdate companyUpdate;
    private final PasswordEncoder passwordEncoder;

    public CompanyService(CompanyRepository companyRepository, CompanyMapper companyMapper, CompanyUpdate companyUpdate, PasswordEncoder passwordEncoder){
        this.companyRepository = companyRepository;
        this.companyMapper = companyMapper;
        this.companyUpdate = companyUpdate;
        this.passwordEncoder = passwordEncoder;
    }

    public ResponseEntity<CompanyResponseDTO> getCompanyByCnpj(String cnpj){
        Company company = companyRepository.findById(cnpj).orElseThrow(() -> new ResourceNotFoundException("Company with CNPJ " + cnpj + " does not exists"));
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

    public ResponseEntity<CompanyResponseDTO> createCompany(CompanyRequestDTO companyRequestDTO){
        String companyCnpj = companyRequestDTO.getCompanyCnpj();
        Optional<Company> exists = companyRepository.findById(companyCnpj);
        if(exists.isPresent()){
            throw new DuplicateResourceException("Company with CNPJ " + companyCnpj + " already exists");
        }

        String companyEmail = companyRequestDTO.getCompanyEmail();
        exists = companyRepository.findByCompanyEmail(companyEmail);
        if(exists.isPresent()){
            throw new DuplicateResourceException("Company with email " + companyEmail + " already exists");
        }

        String companyWhatsappNumber = companyRequestDTO.getCompanyWhatsappNumber();
        exists = companyRepository.findByCompanyWhatsappNumber(companyWhatsappNumber);
        if(exists.isPresent()){
            throw new DuplicateResourceException("Company with whatsapp number " + companyWhatsappNumber + " already exists");
        }

        Company company = companyMapper.toEntity(companyRequestDTO);
        company.setRole(CompanyRole.USER);
        company.setCompanyPassword(passwordEncoder.encode(company.getCompanyPassword()));
        CompanyResponseDTO companyResponseDTO = companyMapper.toDto(companyRepository.save(company));
        return ResponseEntity.status(HttpStatus.CREATED).body(companyResponseDTO);
    }

    public ResponseEntity<CompanyResponseDTO> updateCompanyByCnpj(CompanyRequestDTO companyRequestDTO, String cnpj){
        Company company = companyRepository.findById(cnpj).orElseThrow(() -> new ResourceNotFoundException("Company with CNPJ " + cnpj + " does not exists"));
        if(!companyRequestDTO.getCompanyCnpj().equals(cnpj)){
            throw new ImmutableResourceException("CNPJ cannot be changed");
        }
        companyUpdate.updateCompany(companyRequestDTO, company);
        CompanyResponseDTO companyResponseDTO = companyMapper.toDto(companyRepository.save(company));
        return ResponseEntity.status(HttpStatus.CREATED).body(companyResponseDTO);
    }

    public ResponseEntity<CompanyResponseDTO> deleteCompanyByCnpj(String cnpj){
        Company company = companyRepository.findById(cnpj).orElseThrow(() -> new ResourceNotFoundException("Company with CNPJ " + cnpj + " does not exists"));
        companyRepository.delete(company);
        return ResponseEntity.status(HttpStatus.OK).body(companyMapper.toDto(company));
    }

    public ResponseEntity<List<CompanyResponseDTO>> deleteAllCompanies(){
        List<Company> companies = companyRepository.findAll();
        List<CompanyResponseDTO> companiesResponseDto = new ArrayList<>();
        companies.forEach(company -> {
            companiesResponseDto.add(companyMapper.toDto(company));
        });
        companyRepository.deleteAll();
        return ResponseEntity.status(HttpStatus.OK).body(companiesResponseDto);
    }
}

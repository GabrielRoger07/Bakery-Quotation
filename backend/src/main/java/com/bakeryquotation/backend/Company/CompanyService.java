package com.bakeryquotation.backend.Company;

import com.bakeryquotation.backend.Company.DTO.CompanyRequestDTO;
import com.bakeryquotation.backend.Company.DTO.CompanyResponseDTO;
import com.bakeryquotation.backend.Company.DTO.Login.LoginRequestDTO;
import com.bakeryquotation.backend.Company.DTO.Login.LoginResponseDTO;
import com.bakeryquotation.backend.Company.mapper.CompanyMapper;
import com.bakeryquotation.backend.Company.mapper.CompanyUpdate;
import com.bakeryquotation.backend.Department.Department;
import com.bakeryquotation.backend.Department.DepartmentRepository;
import com.bakeryquotation.backend.config.AuthUserDetails;
import com.bakeryquotation.backend.config.TokenConfig;
import com.bakeryquotation.backend.exception.DuplicateResourceException;
import com.bakeryquotation.backend.exception.ImmutableResourceException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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
    private final AuthenticationManager authenticationManager;
    private final TokenConfig tokenConfig;
    private final DepartmentRepository departmentRepository;

    public CompanyService(CompanyRepository companyRepository, CompanyMapper companyMapper, CompanyUpdate companyUpdate, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, TokenConfig tokenConfig, DepartmentRepository departmentRepository){
        this.companyRepository = companyRepository;
        this.companyMapper = companyMapper;
        this.companyUpdate = companyUpdate;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenConfig = tokenConfig;
        this.departmentRepository = departmentRepository;
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
        Optional<Company> companyWithSameCnpj = companyRepository.findById(companyCnpj);
        if(companyWithSameCnpj.isPresent()){
            throw new DuplicateResourceException("Company with CNPJ " + companyCnpj + " already exists");
        }

        String companyEmail = companyRequestDTO.getCompanyEmail().trim();
        Boolean emailAlreadyRegistered = companyRepository.existsCompanyByCompanyEmail(companyEmail);
        if(emailAlreadyRegistered){
            throw new DuplicateResourceException("Company with email " + companyEmail + " already exists");
        }

        String companyWhatsappNumber = companyRequestDTO.getCompanyWhatsappNumber();
        Optional<Company> companyWithSameWhatsappNumber = companyRepository.findByCompanyWhatsappNumber(companyWhatsappNumber);
        if(companyWithSameWhatsappNumber.isPresent()){
            throw new DuplicateResourceException("Company with whatsapp number " + companyWhatsappNumber + " already exists");
        }

        Company company = companyMapper.toEntity(companyRequestDTO);
        company.setRole(CompanyRole.COMPANY);
        company.setCompanyPassword(passwordEncoder.encode(company.getCompanyPassword()));
        Company savedCompany = companyRepository.save(company);
        departmentRepository.save(new Department("Default", savedCompany));
        CompanyResponseDTO companyResponseDTO = companyMapper.toDto(savedCompany);
        return ResponseEntity.status(HttpStatus.CREATED).body(companyResponseDTO);
    }

    public ResponseEntity<LoginResponseDTO> loginCompany(LoginRequestDTO loginRequestDTO){
        String loginEmail = loginRequestDTO.getCompanyEmail().trim();
        UsernamePasswordAuthenticationToken userAndPassword = new UsernamePasswordAuthenticationToken(loginEmail, loginRequestDTO.getCompanyPassword());
        Authentication authentication = authenticationManager.authenticate(userAndPassword);

        String companyEmail = ((AuthUserDetails) authentication.getPrincipal()).getUsername();
        Company company = companyRepository.findByCompanyEmail(companyEmail).orElseThrow(() -> new ResourceNotFoundException("Company with email " + companyEmail + " does not exists"));
        String accessToken = tokenConfig.generateToken(company);
        String refreshToken = tokenConfig.generateRefreshToken(company);
        LoginResponseDTO loginResponseDTO = new LoginResponseDTO(accessToken, refreshToken);

        return ResponseEntity.status(HttpStatus.OK).body(loginResponseDTO);
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

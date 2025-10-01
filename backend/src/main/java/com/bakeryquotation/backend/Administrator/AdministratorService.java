package com.bakeryquotation.backend.Administrator;

import com.bakeryquotation.backend.Administrator.mapper.AdministratorMapper;
import com.bakeryquotation.backend.Company.CompanyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdministratorService {

    private final AdministratorRepository administratorRepository;
    private final AdministratorMapper administratorMapper;

    public AdministratorService(AdministratorRepository administratorRepository, AdministratorMapper administratorMapper){
        this.administratorRepository = administratorRepository;
        this.administratorMapper = administratorMapper;
    }

    public ResponseEntity<AdministratorResponseDTO> findAdministratorById(Long id){
        Administrator administrator = administratorRepository.findById(id).orElseThrow(() -> new RuntimeException("Administrator with id " + id + " does not exists"));
        return ResponseEntity.status(HttpStatus.OK).body(administratorMapper.toDto(administrator));
    }

    public ResponseEntity<List<AdministratorResponseDTO>> findAllAdministrators(){
        List<Administrator> administrators = administratorRepository.findAll();
        List<AdministratorResponseDTO> administratorResponseDTOS = new ArrayList<>();
        administrators.forEach(administrator -> {
            administratorResponseDTOS.add(administratorMapper.toDto(administrator));
        });
        return ResponseEntity.status(HttpStatus.OK).body(administratorResponseDTOS);
    }

    public ResponseEntity<AdministratorResponseDTO> deleteAdministratorById(Long id){
        Administrator administrator = administratorRepository.findById(id).orElseThrow(() -> new RuntimeException("Administrator with id " + id + " does not exists"));
        administratorRepository.delete(administrator);
        return ResponseEntity.status(HttpStatus.OK).body(administratorMapper.toDto(administrator));
    }
}

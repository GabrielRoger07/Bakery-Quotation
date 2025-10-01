package com.bakeryquotation.backend.Administrator;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/administrators")
public class AdministratorController {

    private final AdministratorService administratorService;

    public AdministratorController(AdministratorService administratorService){
        this.administratorService = administratorService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdministratorResponseDTO> getAdministratorById(@PathVariable("id") Long id){
        return administratorService.getAdministratorById(id);
    }

    @GetMapping
    public ResponseEntity<List<AdministratorResponseDTO>> getAllAdministrators(){
        return administratorService.getAllAdministrators();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AdministratorResponseDTO> deleteAdministratorById(@PathVariable("id") Long id){
        return administratorService.deleteAdministratorById(id);
    }
}

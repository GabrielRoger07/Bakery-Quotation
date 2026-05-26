package com.bakeryquotation.backend.Department;

import com.bakeryquotation.backend.Department.DTO.DepartmentRequestDTO;
import com.bakeryquotation.backend.Department.DTO.DepartmentResponseDTO;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponseDTO> getDepartmentById(@PathVariable("id") Long id) {
        return departmentService.getDepartmentById(id);
    }

    @GetMapping
    public ResponseEntity<List<DepartmentResponseDTO>> getAllDepartments() {
        return departmentService.getAllDepartments();
    }

    @GetMapping("/company")
    public ResponseEntity<Page<DepartmentResponseDTO>> getDepartmentsByCompanyEmail(
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(value = "value", required = false) String value
    ) {
        return departmentService.getDepartmentsByCompanyEmail(pageable, value);
    }

    @PostMapping
    public ResponseEntity<DepartmentResponseDTO> createDepartment(@Valid @RequestBody DepartmentRequestDTO departmentRequestDTO) {
        return departmentService.createDepartment(departmentRequestDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartmentResponseDTO> updateDepartmentById(@Valid @RequestBody DepartmentRequestDTO departmentRequestDTO, @PathVariable("id") Long id) {
        return departmentService.updateDepartmentById(departmentRequestDTO, id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DepartmentResponseDTO> deleteDepartmentById(@PathVariable("id") Long id) {
        return departmentService.deleteDepartmentById(id);
    }

    @DeleteMapping
    public ResponseEntity<List<DepartmentResponseDTO>> deleteAllDepartments() {
        return departmentService.deleteAllDepartments();
    }
}

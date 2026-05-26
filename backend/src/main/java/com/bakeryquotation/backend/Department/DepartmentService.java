package com.bakeryquotation.backend.Department;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Department.DTO.DepartmentRequestDTO;
import com.bakeryquotation.backend.Department.DTO.DepartmentResponseDTO;
import com.bakeryquotation.backend.Department.mapper.DepartmentMapper;
import com.bakeryquotation.backend.exception.AccessDeniedException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DepartmentService {

    @Value("${app.pagination-size}")
    private int pageSize;

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;
    private final CompanyRepository companyRepository;

    public DepartmentService(DepartmentRepository departmentRepository, DepartmentMapper departmentMapper, CompanyRepository companyRepository) {
        this.departmentRepository = departmentRepository;
        this.departmentMapper = departmentMapper;
        this.companyRepository = companyRepository;
    }

    public ResponseEntity<DepartmentResponseDTO> getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Department with id " + id + " does not exist"));
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if(!email.equals(department.getCompany().getCompanyEmail())) {
            throw new AccessDeniedException("You do not have permission to perform this action. Nice try");
        }
        return ResponseEntity.status(HttpStatus.OK).body(departmentMapper.toDto(department));
    }

    public ResponseEntity<List<DepartmentResponseDTO>> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        List<DepartmentResponseDTO> departmentResponseDTOS = new ArrayList<>();
        departments.forEach(department -> {
            departmentResponseDTOS.add(departmentMapper.toDto(department));
        });
        return ResponseEntity.status(HttpStatus.OK).body(departmentResponseDTOS);
    }

    public ResponseEntity<Page<DepartmentResponseDTO>> getDepartmentsByCompanyEmail(Pageable pageable, String value) {
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Pageable safePageable = PageRequest.of(pageable.getPageNumber(), pageSize, pageable.getSort());
        Page<Department> departmentsByCompany;

        boolean applyFilter = value != null && !value.isBlank();

        if(applyFilter) {
            departmentsByCompany = departmentRepository.findByCompany_CompanyEmailAndDepartmentNameContainsIgnoreCase(companyEmail, value, safePageable);
        } else {
            departmentsByCompany = departmentRepository.findByCompany_CompanyEmail(companyEmail, safePageable);
        }

        Page<DepartmentResponseDTO> departmentsResponseDTOByCompany = departmentsByCompany.map(departmentMapper::toDto);
        return ResponseEntity.status(HttpStatus.OK).body(departmentsResponseDTOByCompany);
    }

    public ResponseEntity<DepartmentResponseDTO> createDepartment(DepartmentRequestDTO departmentRequestDTO){
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Company company = companyRepository.findByCompanyEmail(companyEmail).orElseThrow(() -> new ResourceNotFoundException("Company with email " + companyEmail + " does not exist"));

        List<Department> departments = departmentRepository.findByCompany_CompanyEmail(companyEmail);
        Department department;

        // Se houver apenas o Default, muda o nome de Default para o nome enviado no request
        if(departments.size() == 1 && departments.getFirst().getDepartmentName().equalsIgnoreCase("Default")) {
            department = departments.getFirst();
            department.setDepartmentName(departmentRequestDTO.getDepartmentName());
        } else {
            department = departmentMapper.toEntity(departmentRequestDTO);
            department.setCompany(company);
        }

        Department departmentSaved = departmentRepository.save(department);
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentMapper.toDto(departmentSaved));
    }

    public ResponseEntity<DepartmentResponseDTO> updateDepartmentById(DepartmentRequestDTO departmentRequestDTO, Long id){
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Department department = departmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Department with id " + id + " does not exist"));

        if(!companyEmail.equals(department.getCompany().getCompanyEmail())) {
            throw new AccessDeniedException("You do not have permission to perform this action. Nice try");
        }

        if(department.getDepartmentName().equalsIgnoreCase("Default")) {
            throw new AccessDeniedException("You do not have created any department yet");
        }

        department.setDepartmentName(departmentRequestDTO.getDepartmentName());
        Department departmentUpdated = departmentRepository.save(department);
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentMapper.toDto(departmentUpdated));
    }

    public ResponseEntity<DepartmentResponseDTO> deleteDepartmentById(Long id){
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Department department = departmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Department with id " + id + " does not exist"));
        if(!companyEmail.equals(department.getCompany().getCompanyEmail())) {
            throw new AccessDeniedException("You do not have permission to perform this action. Nice try");
        }

        if(department.getDepartmentName().equalsIgnoreCase("Default")) {
            throw new AccessDeniedException("You cannot delete default department");
        }

        List<Department> departments = departmentRepository.findByCompany_CompanyEmail(companyEmail);
        if(departments.size() == 1) {
            department.setDepartmentName("Default");
            departmentRepository.save(department);
        } else {
            departmentRepository.delete(department);
        }

        return ResponseEntity.status(HttpStatus.OK).body(departmentMapper.toDto(department));
    }

    public ResponseEntity<List<DepartmentResponseDTO>> deleteAllDepartments(){
        List<Department> departments = departmentRepository.findAll();
        List<DepartmentResponseDTO> departmentResponseDTOS = new ArrayList<>();
        if(!departments.isEmpty()) {
            departments.forEach(department -> {
                departmentResponseDTOS.add(departmentMapper.toDto(department));
            });
            departmentRepository.deleteAll();
        }
        return ResponseEntity.status(HttpStatus.OK).body(departmentResponseDTOS);
    }
}

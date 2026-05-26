package com.bakeryquotation.backend.Department.mapper;

import com.bakeryquotation.backend.Department.DTO.DepartmentRequestDTO;
import com.bakeryquotation.backend.Department.DTO.DepartmentResponseDTO;
import com.bakeryquotation.backend.Department.Department;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DepartmentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "products", ignore = true)
    Department toEntity(DepartmentRequestDTO departmentRequestDTO);

    @Mapping(source = "id", target = "departmentId")
    @Mapping(source = "company.companyCnpj", target = "companyCnpj")
    DepartmentResponseDTO toDto(Department department);
}

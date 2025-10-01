package com.bakeryquotation.backend.Company.mapper;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.DTO.CompanyRequestDTO;
import com.bakeryquotation.backend.Company.DTO.CompanyResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CompanyMapper {

    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    Company toEntity(CompanyRequestDTO companyRequestDTO);

    CompanyResponseDTO toDto(Company company);
}

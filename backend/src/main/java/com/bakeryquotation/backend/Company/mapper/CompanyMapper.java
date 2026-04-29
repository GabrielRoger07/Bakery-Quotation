package com.bakeryquotation.backend.Company.mapper;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.DTO.CompanyRequestDTO;
import com.bakeryquotation.backend.Company.DTO.CompanyResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CompanyMapper {

    @Mapping(target = "createdAt", expression = "java(java.time.Instant.now())")
    @Mapping(target = "role", constant = "COMPANY")
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "quotations", ignore = true)
    @Mapping(target = "suppliers", ignore = true)
    Company toEntity(CompanyRequestDTO companyRequestDTO);

    CompanyResponseDTO toDto(Company company);
}

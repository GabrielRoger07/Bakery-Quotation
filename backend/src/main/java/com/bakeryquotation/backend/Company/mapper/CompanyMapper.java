package com.bakeryquotation.backend.Company.mapper;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRequestDTO;
import com.bakeryquotation.backend.Company.CompanyResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CompanyMapper {

    @Mapping(target = "createdAt", ignore = true)
    Company toEntity(CompanyRequestDTO companyRequestDTO);

    CompanyResponseDTO toDto(Company company);
}

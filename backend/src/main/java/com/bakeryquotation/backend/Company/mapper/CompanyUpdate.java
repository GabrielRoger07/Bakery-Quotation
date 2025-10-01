package com.bakeryquotation.backend.Company.mapper;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRequestDTO;
import com.bakeryquotation.backend.Company.CompanyResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CompanyUpdate {

    void updateCompany(CompanyRequestDTO companyRequestDTO, @MappingTarget Company company);
}

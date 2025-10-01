package com.bakeryquotation.backend.Administrator.mapper;

import com.bakeryquotation.backend.Administrator.Administrator;
import com.bakeryquotation.backend.Administrator.DTO.AdministratorRequestDTO;
import com.bakeryquotation.backend.Administrator.DTO.AdministratorResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AdministratorMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Administrator toEntity(AdministratorRequestDTO administratorRequestDTO);

    @Mapping(source = "id", target = "administratorId")
    AdministratorResponseDTO toDto(Administrator administrator);
}

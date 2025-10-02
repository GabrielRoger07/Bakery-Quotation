package com.bakeryquotation.backend.Participation;

import com.bakeryquotation.backend.Participation.DTO.ParticipationRequestDTO;
import com.bakeryquotation.backend.Participation.DTO.ParticipationResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ParticipationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "quotation", ignore = true)
    Participation toEntity(ParticipationRequestDTO participationRequestDTO);

    @Mapping(source = "id", target = "participationId")
    @Mapping(source = "supplier.id", target = "supplierId")
    @Mapping(source = "quotation.id", target = "quotationId")
    ParticipationResponseDTO toDto(Participation participation);
}

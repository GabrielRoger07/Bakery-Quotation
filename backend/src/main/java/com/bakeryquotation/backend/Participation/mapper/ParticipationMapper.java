package com.bakeryquotation.backend.Participation.mapper;

import com.bakeryquotation.backend.Participation.DTO.ParticipationRequestDTO;
import com.bakeryquotation.backend.Participation.DTO.ParticipationResponseDTO;
import com.bakeryquotation.backend.Participation.DTO.SupplierParticipationResponseDTO;
import com.bakeryquotation.backend.Participation.Participation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ParticipationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "quotation", ignore = true)
    @Mapping(target = "bids", ignore = true)
    Participation toEntity(ParticipationRequestDTO participationRequestDTO);

    @Mapping(source = "id", target = "participationId")
    @Mapping(source = "quotation.id", target = "quotationId")
    @Mapping(source = "supplier.id", target = "supplierId")
    @Mapping(source = "supplier.supplierName", target = "supplierName")
    @Mapping(source = "supplier.employerName", target = "employerName")
    ParticipationResponseDTO toDto(Participation participation);

    @Mapping(source = "id", target = "participationId")
    @Mapping(source = "quotation.id", target = "quotationId")
    @Mapping(source = "supplier.id", target = "supplierId")
    @Mapping(source = "supplier.supplierName", target = "supplierName")
    @Mapping(source = "supplier.employerName", target = "employerName")
    @Mapping(source = "quotation.quotationStart", target = "quotationStart")
    @Mapping(source = "quotation.quotationEnd", target = "quotationEnd")
    SupplierParticipationResponseDTO toSupplierParticipationDto(Participation participation);
}

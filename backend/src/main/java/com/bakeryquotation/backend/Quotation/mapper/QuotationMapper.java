package com.bakeryquotation.backend.Quotation.mapper;

import com.bakeryquotation.backend.Quotation.Quotation;
import com.bakeryquotation.backend.Quotation.DTO.QuotationRequestDTO;
import com.bakeryquotation.backend.Quotation.DTO.QuotationResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuotationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Quotation toEntity(QuotationRequestDTO quotationRequestDTO);

    @Mapping(source = "id", target = "quotationId")
    QuotationResponseDTO toDto(Quotation quotation);
}

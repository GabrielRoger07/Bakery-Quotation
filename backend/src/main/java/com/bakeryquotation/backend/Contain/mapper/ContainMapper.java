package com.bakeryquotation.backend.Contain.mapper;

import com.bakeryquotation.backend.Contain.Contain;
import com.bakeryquotation.backend.Contain.DTO.ContainRequestDTO;
import com.bakeryquotation.backend.Contain.DTO.ContainResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ContainMapper {

    @Mapping(target = "containId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "quotation", ignore = true)
    Contain toEntity(ContainRequestDTO containRequestDTO);

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "quotation.id", target = "quotationId")
    @Mapping(source = "product.productBarCodeNumber", target = "productBarCodeNumber")
    @Mapping(source = "product.productName", target = "productName")
    @Mapping(source = "product.productDescription", target = "productDescription")
    ContainResponseDTO toDto(Contain contain);
}

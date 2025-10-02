package com.bakeryquotation.backend.Supplier.mapper;

import com.bakeryquotation.backend.Supplier.Supplier;
import com.bakeryquotation.backend.Supplier.DTO.SupplierRequestDTO;
import com.bakeryquotation.backend.Supplier.DTO.SupplierResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SupplierMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    Supplier toEntity(SupplierRequestDTO supplierRequestDTO);

    @Mapping(source = "id", target = "supplierId")
    SupplierResponseDTO toDto(Supplier supplier);
}

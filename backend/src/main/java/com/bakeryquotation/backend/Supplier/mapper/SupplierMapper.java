package com.bakeryquotation.backend.Supplier.mapper;

import com.bakeryquotation.backend.Supplier.Supplier;
import com.bakeryquotation.backend.Supplier.SupplierRequestDTO;
import com.bakeryquotation.backend.Supplier.SupplierResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SupplierMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Supplier toEntity(SupplierRequestDTO supplierRequestDTO);

    SupplierResponseDTO supplierResponseDTO(Supplier supplier);
}

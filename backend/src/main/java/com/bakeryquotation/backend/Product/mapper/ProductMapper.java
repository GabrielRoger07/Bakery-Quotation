package com.bakeryquotation.backend.Product.mapper;

import com.bakeryquotation.backend.Product.Product;
import com.bakeryquotation.backend.Product.DTO.ProductRequestDTO;
import com.bakeryquotation.backend.Product.DTO.ProductResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "bids", ignore = true)
    @Mapping(target = "contains", ignore = true)
    Product toEntity(ProductRequestDTO productRequestDTO);

    @Mapping(source = "id", target = "productId")
    @Mapping(source = "company.companyCnpj", target = "companyCnpj")
    ProductResponseDTO toDto(Product product);
}

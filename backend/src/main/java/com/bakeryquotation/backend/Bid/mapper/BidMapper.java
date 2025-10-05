package com.bakeryquotation.backend.Bid.mapper;

import com.bakeryquotation.backend.Bid.Bid;
import com.bakeryquotation.backend.Bid.DTO.BidRequestDTO;
import com.bakeryquotation.backend.Bid.DTO.BidResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BidMapper {

    @Mapping(target = "bidId", ignore = true)
    @Mapping(target = "participation", ignore = true)
    @Mapping(target = "product", ignore = true)
    Bid toEntity(BidRequestDTO bidRequestDTO);

    @Mapping(source = "participation.id", target = "participationId")
    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "bidId.createdAt", target = "createdAt")
    BidResponseDTO toDto(Bid bid);
}

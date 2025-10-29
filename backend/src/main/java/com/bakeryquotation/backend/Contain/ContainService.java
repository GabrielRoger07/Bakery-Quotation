package com.bakeryquotation.backend.Contain;

import com.bakeryquotation.backend.Bid.Bid;
import com.bakeryquotation.backend.Bid.BidId;
import com.bakeryquotation.backend.Contain.DTO.ContainRequestDTO;
import com.bakeryquotation.backend.Contain.DTO.ContainResponseDTO;
import com.bakeryquotation.backend.Contain.mapper.ContainMapper;
import com.bakeryquotation.backend.Product.Product;
import com.bakeryquotation.backend.Product.ProductRepository;
import com.bakeryquotation.backend.Quotation.Quotation;
import com.bakeryquotation.backend.Quotation.QuotationRepository;
import com.bakeryquotation.backend.exception.DuplicateResourceException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ContainService {

    private final ContainRepository containRepository;
    private final ContainMapper containMapper;
    private final ProductRepository productRepository;
    private final QuotationRepository quotationRepository;

    public ContainService(ContainRepository containRepository, ContainMapper containMapper, ProductRepository productRepository, QuotationRepository quotationRepository){
        this.containRepository = containRepository;
        this.containMapper = containMapper;
        this.productRepository = productRepository;
        this.quotationRepository = quotationRepository;
    }

    public ResponseEntity<ContainResponseDTO> getContainById(Long quotationId, Long productId){
        ContainId containId = new ContainId(productId, quotationId);
        Contain contain = containRepository.findById(containId).orElseThrow(() -> new ResourceNotFoundException("Contain with productId " + productId + " and quotationId " + quotationId + " does not exists"));

        ContainResponseDTO containResponseDTO = containMapper.toDto(contain);
        return ResponseEntity.status(HttpStatus.OK).body(containResponseDTO);
    }

    public ResponseEntity<List<ContainResponseDTO>> getAllContains(){
        List<Contain> contains = containRepository.findAll();
        List<ContainResponseDTO> containResponseDTOS = new ArrayList<>();

        contains.forEach(contain -> {
            containResponseDTOS.add(containMapper.toDto(contain));
        });

        return ResponseEntity.status(HttpStatus.OK).body(containResponseDTOS);
    }

    public ResponseEntity<List<ContainResponseDTO>> getAllContainsByQuotationId(Long quotationId){
        List<Contain> contains = containRepository.findAllByQuotation_Id(quotationId);
        List<ContainResponseDTO> containResponseDTOS = new ArrayList<>();

        contains.forEach(contain -> {
            containResponseDTOS.add(containMapper.toDto(contain));
        });
        return ResponseEntity.status(HttpStatus.OK).body(containResponseDTOS);
    }

    public ResponseEntity<ContainResponseDTO> createContain(ContainRequestDTO containRequestDTO){
        Long productId = containRequestDTO.getProductId();
        Long quotationId = containRequestDTO.getQuotationId();

        Product product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product with id " + productId + " does not exists"));
        Quotation quotation = quotationRepository.findById(quotationId).orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + quotationId + " does not exists"));

        ContainId containId = new ContainId(productId, quotationId);
        Optional<Contain> exists = containRepository.findById(containId);
        if(exists.isPresent()){
            throw new DuplicateResourceException("Contain with product id " + productId + " and quotation id " + quotationId + " already exists");
        }

        Contain contain = containMapper.toEntity(containRequestDTO);
        contain.setContainId(containId);
        contain.setProduct(product);
        contain.setQuotation(quotation);

        Contain containCreated = containRepository.save(contain);
        return ResponseEntity.status(HttpStatus.CREATED).body(containMapper.toDto(containCreated));
    }

    public ResponseEntity<List<ContainResponseDTO>> createContains(List<ContainRequestDTO> containRequestDTOS){

        List<ContainResponseDTO> containResponseDTOS = new ArrayList<>();

        containRequestDTOS.forEach(containRequestDTO -> {
            Long productId = containRequestDTO.getProductId();
            Product product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product with id " + productId + " does not exists"));

            Long quotationId = containRequestDTO.getQuotationId();
            Quotation quotation = quotationRepository.findById(quotationId).orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + quotationId + " does not exists"));

            ContainId containId = new ContainId(quotationId, productId);
            Optional<Contain> exists = containRepository.findById(containId);
            if(exists.isPresent()){
                throw new DuplicateResourceException("Contain with product id " + productId + " and quotation id " + quotationId + " already exists");
            }

            Contain contain = containMapper.toEntity(containRequestDTO);
            contain.setContainId(containId);
            contain.setProduct(product);
            contain.setQuotation(quotation);

            Contain containCreated = containRepository.save(contain);
            containResponseDTOS.add(containMapper.toDto(containCreated));
        });

        return ResponseEntity.status(HttpStatus.CREATED).body(containResponseDTOS);
    }

    public ResponseEntity<List<ContainResponseDTO>> updateContains(List<ContainRequestDTO> containRequestDTOS){
        List<ContainResponseDTO> containResponseDTOS = new ArrayList<>();
        List<Long> requestProductIds = containRequestDTOS.stream().map(ContainRequestDTO::getProductId).toList();

        List<Contain> containsByQuotationId = containRepository.findAllByQuotation_Id(containRequestDTOS.getFirst().getQuotationId());
        List<Contain> containsToRemove = containsByQuotationId.stream().filter(contain -> !requestProductIds.contains(contain.getProduct().getId())).toList();

        // Removing old contains that are not on request
        containRepository.deleteAll(containsToRemove);

        containRequestDTOS.forEach(contain -> {
            Long productId = contain.getProductId();
            Product product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product with id " + productId + " does not exists"));

            Long quotationId = contain.getQuotationId();
            Quotation quotation = quotationRepository.findById(quotationId).orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + quotationId + " does not exists"));

            ContainId containId = new ContainId(quotationId, productId);

            Contain newContain = containMapper.toEntity(contain);
            newContain.setContainId(containId);
            newContain.setProduct(product);
            newContain.setQuotation(quotation);

            containRepository.save(newContain);
            containResponseDTOS.add(containMapper.toDto(newContain));
        });

        return ResponseEntity.status(HttpStatus.OK).body(containResponseDTOS);
    }

    public ResponseEntity<ContainResponseDTO> deleteContainById(Long quotationId, Long productId){
        ContainId containId = new ContainId(quotationId, productId);
        Contain contain = containRepository.findById(containId).orElseThrow(() -> new ResourceNotFoundException("Contain with productId " + productId + " and quotationId " + quotationId + " does not exists"));

        ContainResponseDTO containResponseDTO = containMapper.toDto(contain);
        containRepository.deleteById(containId);
        return ResponseEntity.status(HttpStatus.OK).body(containResponseDTO);
    }

    public ResponseEntity<List<ContainResponseDTO>> deleteAllContains(){
        List<Contain> contains = containRepository.findAll();
        List<ContainResponseDTO> containResponseDTOS = new ArrayList<>();

        contains.forEach(contain -> {
            containResponseDTOS.add(containMapper.toDto(contain));
        });

        containRepository.deleteAll();
        return ResponseEntity.status(HttpStatus.OK).body(containResponseDTOS);
    }
}

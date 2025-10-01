package com.bakeryquotation.backend.Product;

import com.bakeryquotation.backend.Product.DTO.ProductResponseDTO;
import com.bakeryquotation.backend.Product.mapper.ProductMapper;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository, ProductMapper productMapper){
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    public ResponseEntity<List<ProductResponseDTO>> getAllProducts(){
        List<Product> products = productRepository.findAll();
        List<ProductResponseDTO> productResponseDTOS = new ArrayList<>();
        products.forEach(product -> {
            productResponseDTOS.add(productMapper.toDto(product));
        });
        return ResponseEntity.status(HttpStatus.OK).body(productResponseDTOS);
    }

    public ResponseEntity<ProductResponseDTO> getProductById(Long id){
        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " does not exists"));
        return ResponseEntity.status(HttpStatus.OK).body(productMapper.toDto(product));
    }

    public ResponseEntity<ProductResponseDTO> deleteProductById(Long id){
        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " does not exists"));
        productRepository.delete(product);
        return ResponseEntity.status(HttpStatus.OK).body(productMapper.toDto(product));
    }
}

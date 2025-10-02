package com.bakeryquotation.backend.Product;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Product.DTO.ProductRequestDTO;
import com.bakeryquotation.backend.Product.DTO.ProductResponseDTO;
import com.bakeryquotation.backend.Product.mapper.ProductMapper;
import com.bakeryquotation.backend.exception.ImmutableResourceException;
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
    private final CompanyRepository companyRepository;

    public ProductService(ProductRepository productRepository, ProductMapper productMapper, CompanyRepository companyRepository){
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.companyRepository = companyRepository;
    }

    public ResponseEntity<ProductResponseDTO> getProductById(Long id){
        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " does not exists"));
        return ResponseEntity.status(HttpStatus.OK).body(productMapper.toDto(product));
    }

    public ResponseEntity<List<ProductResponseDTO>> getAllProducts(){
        List<Product> products = productRepository.findAll();
        List<ProductResponseDTO> productResponseDTOS = new ArrayList<>();
        products.forEach(product -> {
            productResponseDTOS.add(productMapper.toDto(product));
        });
        return ResponseEntity.status(HttpStatus.OK).body(productResponseDTOS);
    }

    public ResponseEntity<ProductResponseDTO> createProduct(ProductRequestDTO productRequestDTO){
        Product product = productMapper.toEntity(productRequestDTO);

        String companyCnpj = productRequestDTO.getCompanyCnpj();
        Company company = companyRepository.findById(companyCnpj).orElseThrow(() -> new ResourceNotFoundException("Company with CNPJ " + companyCnpj + " does not exists"));
        product.setCompany(company);

        Product productSaved = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(productMapper.toDto(productSaved));
    }

    public ResponseEntity<ProductResponseDTO> updateProductById(ProductRequestDTO productRequestDTO, Long id){
        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " does not exists"));
        if(!productRequestDTO.getCompanyCnpj().equals(product.getCompany().getCompanyCnpj())){
            throw new ImmutableResourceException("Company CNPJ cannot be changed");
        }
        product.setProductName(productRequestDTO.getProductName());
        product.setUnitOfMeasure(productRequestDTO.getUnitOfMeasure());
        Product productUpdated = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(productMapper.toDto(productUpdated));
    }

    public ResponseEntity<ProductResponseDTO> deleteProductById(Long id){
        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " does not exists"));
        productRepository.delete(product);
        return ResponseEntity.status(HttpStatus.OK).body(productMapper.toDto(product));
    }

    public ResponseEntity<List<ProductResponseDTO>> deleteAllProducts(){
        List<Product> products = productRepository.findAll();
        List<ProductResponseDTO> productResponseDTOS = new ArrayList<>();
        products.forEach(product -> {
            productResponseDTOS.add(productMapper.toDto(product));
        });
        productRepository.deleteAll();
        return ResponseEntity.status(HttpStatus.OK).body(productResponseDTOS);
    }
}

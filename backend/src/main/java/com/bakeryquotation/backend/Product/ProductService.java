package com.bakeryquotation.backend.Product;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Product.DTO.ProductRequestDTO;
import com.bakeryquotation.backend.Product.DTO.ProductResponseDTO;
import com.bakeryquotation.backend.Product.mapper.ProductMapper;
import com.bakeryquotation.backend.exception.ImmutableResourceException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    @Value("${app.pagination-size}")
    private int pageSize;

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

    public ResponseEntity<Page<ProductResponseDTO>> getProductsByCompanyCnpj(String cnpj, Pageable pageable, String field, String value, List<Long> excludedIds){
        Pageable safePageable = PageRequest.of(pageable.getPageNumber(), pageSize, pageable.getSort());
        Page<Product> productsByCompany;

        boolean applyFilter = field != null && value != null && !value.isBlank();
        boolean hasExcludedIds = excludedIds != null && !excludedIds.isEmpty();

        if(applyFilter){
            if(field.equals("productBarCodeNumber")){
                if(hasExcludedIds){
                    productsByCompany = productRepository.findByCompanyCnpjAndBarcodeExcludingIds(cnpj, value, excludedIds, safePageable);
                } else {
                    productsByCompany = productRepository.findByCompany_CompanyCnpjAndProductBarCodeNumberContainsIgnoreCase(cnpj, value, safePageable);
                }
            } else if(field.equals("productName")){
                if(hasExcludedIds){
                    productsByCompany = productRepository.findByCompanyCnpjAndNameExcludingIds(cnpj, value, excludedIds, safePageable);
                } else {
                    productsByCompany = productRepository.findByCompany_CompanyCnpjAndProductNameContainsIgnoreCase(cnpj, value, safePageable);
                }
            } else {
                throw new ResourceNotFoundException("Invalid field");
            }

        } else {
            if(hasExcludedIds) {
                productsByCompany = productRepository.findByCompanyCnpjExcludingIds(cnpj, excludedIds, safePageable);
            } else {
                productsByCompany = productRepository.findByCompany_CompanyCnpj(cnpj, safePageable);
            }
        }

        Page<ProductResponseDTO> productsResponseDTOByCompany = productsByCompany.map(productMapper::toDto);
        return ResponseEntity.status(HttpStatus.OK).body(productsResponseDTOByCompany);
    }

    public ResponseEntity<ProductResponseDTO> createProduct(ProductRequestDTO productRequestDTO){
        String companyCnpj = productRequestDTO.getCompanyCnpj();
        Company company = companyRepository.findById(companyCnpj).orElseThrow(() -> new ResourceNotFoundException("Company with CNPJ " + companyCnpj + " does not exists"));

        Product product = productMapper.toEntity(productRequestDTO);
        product.setCompany(company);

        Product productSaved = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(productMapper.toDto(productSaved));
    }

    public ResponseEntity<ProductResponseDTO> updateProductById(ProductRequestDTO productRequestDTO, Long id){
        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " does not exists"));
        if(!productRequestDTO.getCompanyCnpj().equals(product.getCompany().getCompanyCnpj())){
            throw new ImmutableResourceException("Company CNPJ cannot be changed");
        }
        product.setProductBarCodeNumber(productRequestDTO.getProductBarCodeNumber());
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
        if(!products.isEmpty()) {
            products.forEach(product -> {
                productResponseDTOS.add(productMapper.toDto(product));
            });
            productRepository.deleteAll();
        }
        return ResponseEntity.status(HttpStatus.OK).body(productResponseDTOS);
    }
}

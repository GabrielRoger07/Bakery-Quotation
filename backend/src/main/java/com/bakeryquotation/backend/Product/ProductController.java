package com.bakeryquotation.backend.Product;

import com.bakeryquotation.backend.Product.DTO.ProductRequestDTO;
import com.bakeryquotation.backend.Product.DTO.ProductResponseDTO;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService){
        this.productService = productService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable("id") Long id){
        return productService.getProductById(id);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts(){
        return productService.getAllProducts();
    }

    @GetMapping("/company")
    public ResponseEntity<Page<ProductResponseDTO>> getProductsByCompanyEmail(
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(value = "field", required = false) String field,
            @RequestParam(value = "value", required = false) String value,
            @RequestParam(value = "excludedIds", required = false) List<Long> excludedIds
    ){
        return productService.getProductsByCompanyEmail(pageable, field, value, excludedIds);
    }

    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(@Valid @RequestBody ProductRequestDTO productRequestDTO){
        return productService.createProduct(productRequestDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProductById(@Valid @RequestBody ProductRequestDTO productRequestDTO, @PathVariable("id") Long id){
        return productService.updateProductById(productRequestDTO, id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> deleteProductById(@PathVariable("id") Long id){
        return productService.deleteProductById(id);
    }

    @DeleteMapping
    public ResponseEntity<List<ProductResponseDTO>> deleteAllProducts(){
        return productService.deleteAllProducts();
    }
}

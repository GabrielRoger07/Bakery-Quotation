package com.bakeryquotation.backend.Product;

import com.bakeryquotation.backend.Product.DTO.ProductResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService){
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts(){
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(Long id){
        return productService.getProductById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> deleteProductById(Long id){
        return productService.deleteProductById(id);
    }
}

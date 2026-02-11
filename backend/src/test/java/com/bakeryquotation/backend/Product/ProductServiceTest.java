package com.bakeryquotation.backend.Product;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Product.DTO.ProductRequestDTO;
import com.bakeryquotation.backend.Product.DTO.ProductResponseDTO;
import com.bakeryquotation.backend.Product.mapper.ProductMapper;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private ProductService productService;

    private Company company;
    private Product product;
    private ProductRequestDTO productRequestDTO;
    private ProductResponseDTO productResponseDTO;
    private static final Long PRODUCT_ID = 10L;

    @BeforeEach
    void setUp() {
        company = new Company("12345678901234", "Bakery", "11999999999", "bakery@email.com", "secret");
        LocalDateTime createdAt = LocalDateTime.of(2026, 2, 9, 9, 10, 0);
        product = new Product(PRODUCT_ID, "Product A", "10", UnitOfMeasure.kg, company, null, null);
        productRequestDTO = new ProductRequestDTO("Product A", "10", UnitOfMeasure.kg, company.getCompanyCnpj());
        productResponseDTO = new ProductResponseDTO(PRODUCT_ID, "Product A", "10", UnitOfMeasure.kg, company.getCompanyCnpj());
    }

    @Nested
    public class GetProductById {

        @Test
        @DisplayName("should return 200 OK with ProductResponseDTO when product exists")
        void shouldReturnOkWhenProductExists() {
            when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(product));
            when(productMapper.toDto(product)).thenReturn(productResponseDTO);

            ResponseEntity<ProductResponseDTO> result = productService.getProductById(PRODUCT_ID);

            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();
            // assertThat(result.getBody()).isSameAs(productResponseDTO);

            assertThat(result.getBody().getProductId()).isEqualTo(PRODUCT_ID);
            assertThat(result.getBody().getProductName()).isEqualTo(product.getProductName());
            assertThat(result.getBody().getProductBarCodeNumber()).isEqualTo(product.getProductBarCodeNumber());
            assertThat(result.getBody().getUnitOfMeasure()).isEqualTo(product.getUnitOfMeasure());
            assertThat(result.getBody().getCompanyCnpj()).isEqualTo(product.getCompany().getCompanyCnpj());

            verify(productRepository, times(1)).findById(PRODUCT_ID);
            verify(productMapper, times(1)).toDto(product);
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(productRepository, productMapper);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when product doesn't exists")
        void shouldThrowResourceNotFoundExceptionWhenProductDoesntExists() {
            when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> productService.getProductById(PRODUCT_ID))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Product with id " + PRODUCT_ID + " does not exists");

            verify(productRepository, times(1)).findById(PRODUCT_ID);
            verifyNoInteractions(productMapper, companyRepository);
            verifyNoMoreInteractions(productRepository);
        }
    }

    @Nested
    class GetAllProducts {

        @Test
        @DisplayName("should return 200 OK with a list of ProductResponseDTO when products exist")
        void shouldReturnOkWithListWhenProductsExist() {
            Product product1 = product;
            Product product2 = new Product(20L, "Product B", "20", UnitOfMeasure.l, company, null, null);
            ProductResponseDTO productResponseDTO1 = productResponseDTO;
            ProductResponseDTO productResponseDTO2 = new ProductResponseDTO(20L, "Product B", "20", UnitOfMeasure.l, company.getCompanyCnpj());

            when(productRepository.findAll()).thenReturn(List.of(product1, product2));
            when(productMapper.toDto(product1)).thenReturn(productResponseDTO1);
            when(productMapper.toDto(product2)).thenReturn(productResponseDTO2);

            ResponseEntity<List<ProductResponseDTO>> result = productService.getAllProducts();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(2)
                    .containsExactly(productResponseDTO1, productResponseDTO2);

            verify(productRepository, times(1)).findAll();
            verify(productMapper, times(1)).toDto(product1);
            verify(productMapper, times(1)).toDto(product2);
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(productRepository, productMapper);
        }

        @Test
        @DisplayName("should return 200 OK with an empty list when no products exist")
        void shouldReturnOkWithEmptyListWhenNoProductsExist() {
            when(productRepository.findAll()).thenReturn(List.of());

            ResponseEntity<List<ProductResponseDTO>> result = productService.getAllProducts();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(0)
                    .isEmpty();

            verify(productRepository, times(1)).findAll();
            verifyNoInteractions(productMapper, companyRepository);
            verifyNoMoreInteractions(productRepository);
        }
    }

    @Nested
    class DeleteProductById {

        @Test
        @DisplayName("should return 200 OK with ProductResponseDTO and exclude product when product exists")
        void shouldReturnOkWhenDeleteProductSuccessfully() {
            when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(product));
            when(productMapper.toDto(product)).thenReturn(productResponseDTO);

            ResponseEntity<ProductResponseDTO> result = productService.deleteProductById(PRODUCT_ID);

            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();

            assertThat(result.getBody().getProductId()).isEqualTo(PRODUCT_ID);
            assertThat(result.getBody().getProductName()).isEqualTo(product.getProductName());
            assertThat(result.getBody().getProductBarCodeNumber()).isEqualTo(product.getProductBarCodeNumber());
            assertThat(result.getBody().getUnitOfMeasure()).isEqualTo(product.getUnitOfMeasure());
            assertThat(result.getBody().getCompanyCnpj()).isEqualTo(product.getCompany().getCompanyCnpj());

            verify(productRepository, times(1)).findById(PRODUCT_ID);
            verify(productMapper, times(1)).toDto(product);
            verify(productRepository, times(1)).delete(product);
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(productRepository, productMapper);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException and not delete supplier when supplier doesn't exists")
        void shouldThrowResourceNotFoundExceptionAndNotDeleteSupplierWhenSupplierDoesntExists() {
            when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> productService.getProductById(PRODUCT_ID))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Product with id " + PRODUCT_ID + " does not exists");

            verify(productRepository, times(1)).findById(PRODUCT_ID);
            verify(productRepository, never()).delete(product);
            verifyNoInteractions(productMapper, companyRepository);
            verifyNoMoreInteractions(productRepository);
        }
    }

    @Nested
    class DeleteAllProducts {

        @Test
        @DisplayName("should return 200 OK with a list of ProductResponseDTO and delete products when products exist")
        void shouldReturnOkWithListAndDeleteAllProductsWhenProductsExist() {
            Product product1 = product;
            Product product2 = new Product(20L, "Product B", "20", UnitOfMeasure.l, company, null, null);
            ProductResponseDTO productResponseDTO1 = productResponseDTO;
            ProductResponseDTO productResponseDTO2 = new ProductResponseDTO(20L, "Product B", "20", UnitOfMeasure.l, company.getCompanyCnpj());

            when(productRepository.findAll()).thenReturn(List.of(product1, product2));
            when(productMapper.toDto(product1)).thenReturn(productResponseDTO1);
            when(productMapper.toDto(product2)).thenReturn(productResponseDTO2);

            ResponseEntity<List<ProductResponseDTO>> result = productService.deleteAllProducts();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(2)
                    .containsExactly(productResponseDTO1, productResponseDTO2);

            verify(productRepository, times(1)).findAll();
            verify(productMapper, times(1)).toDto(product1);
            verify(productMapper, times(1)).toDto(product2);
            verify(productRepository, times(1)).deleteAll();
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(productRepository, productMapper);
        }

        @Test
        @DisplayName("should return 200 OK with an empty list and try to delete product when no products exist")
        void shouldReturnOkWithEmptyListAndTryToDeleteProductWhenNoProductsExist() {
            when(productRepository.findAll()).thenReturn(List.of());

            ResponseEntity<List<ProductResponseDTO>> result = productService.deleteAllProducts();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(0)
                    .isEmpty();

            verify(productRepository, times(1)).findAll();
            verifyNoInteractions(productMapper);
            verify(productRepository, never()).deleteAll();
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(productRepository);
        }
    }
}

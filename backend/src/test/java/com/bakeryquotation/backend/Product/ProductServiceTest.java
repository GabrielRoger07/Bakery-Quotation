package com.bakeryquotation.backend.Product;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Product.DTO.ProductRequestDTO;
import com.bakeryquotation.backend.Product.DTO.ProductResponseDTO;
import com.bakeryquotation.backend.Product.mapper.ProductMapper;
import com.bakeryquotation.backend.exception.ImmutableResourceException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

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
    class GetProductsByCompanyCnpj {

        private static final String CNPJ = "12345678901234";
        private Pageable pageable;

        @BeforeEach
        void setUpGetProductsByCompanyCnpj() {
            ReflectionTestUtils.setField(productService, "pageSize", 5);
            pageable = PageRequest.of(0, 999, Sort.by("productName").ascending());
        }

        private Page<Product> productPage() {
            Product p1 = product;
            Product p2 = new Product(
                    20L,
                    "Product B",
                    "20",
                    UnitOfMeasure.l,
                    company,
                    null,
                    null
            );
            return new PageImpl<>(List.of(p1, p2), PageRequest.of(0, 5, pageable.getSort()), 2);
        }

        private void stubMapperFor(Page<Product> products) {
            for (Product p : products.getContent()) {
                ProductResponseDTO dto = new ProductResponseDTO(
                        p.getId(),
                        p.getProductName(),
                        p.getProductBarCodeNumber(),
                        p.getUnitOfMeasure(),
                        p.getCompany().getCompanyCnpj()
                );
                when(productMapper.toDto(p)).thenReturn(dto);
            }
        }

        private ArgumentCaptor<Pageable> pageableArgumentCaptor() {
            return ArgumentCaptor.forClass(Pageable.class);
        }

        @Test
        @DisplayName("no filter + no excludedIds -> should call findByCompany_CompanyCnpj with safePageable and return mapped page")
        void noFilter_noExcludedIds_callsFindByCompany_CompanyCnpj() {
            Page<Product> repoPage = productPage();
            stubMapperFor(repoPage);

            ArgumentCaptor<Pageable> captor = pageableArgumentCaptor();
            when(productRepository.findByCompany_CompanyCnpj(eq(CNPJ), captor.capture())).thenReturn(repoPage);

            ResponseEntity<Page<ProductResponseDTO>> result = productService.getProductsByCompanyCnpj(CNPJ, pageable, null, null, null);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();
            assertThat(result.getBody().getTotalElements()).isEqualTo(2);
            assertThat(result.getBody().getContent()).hasSize(2);

            Pageable used = captor.getValue();
            assertThat(used.getPageNumber()).isEqualTo(0);
            assertThat(used.getPageSize()).isEqualTo(5);
            assertThat(used.getSort()).isEqualTo(pageable.getSort());

            verify(productRepository, times(1)).findByCompany_CompanyCnpj(eq(CNPJ), any(Pageable.class));
            verify(productMapper, times(2)).toDto(any(Product.class));
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(productRepository, productMapper);
        }

        @Test
        @DisplayName("no filter + excludedIds -> should call findByCompanyCnpjExcludingIds with safePageable")
        void noFilter_withExcludedIds_callsFindByCompanyCnpjExcludingIds() {
            List<Long> excludedIds = List.of(1L, 2L);

            Page<Product> repoPage = productPage();
            stubMapperFor(repoPage);

            ArgumentCaptor<Pageable> captor = pageableArgumentCaptor();
            when(productRepository.findByCompanyCnpjExcludingIds(eq(CNPJ), eq(excludedIds), captor.capture())).thenReturn(repoPage);

            ResponseEntity<Page<ProductResponseDTO>> result = productService.getProductsByCompanyCnpj(CNPJ, pageable, null, null, excludedIds);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();
            assertThat(result.getBody().getTotalElements()).isEqualTo(2);
            assertThat(result.getBody().getContent()).hasSize(2);

            Pageable used = captor.getValue();
            assertThat(used.getPageNumber()).isEqualTo(0);
            assertThat(used.getPageSize()).isEqualTo(5);
            assertThat(used.getSort()).isEqualTo(pageable.getSort());

            verify(productRepository, times(1)).findByCompanyCnpjExcludingIds(eq(CNPJ), eq(excludedIds), any(Pageable.class));
            verify(productMapper, times(2)).toDto(any(Product.class));
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(productRepository, productMapper);
        }

        @Test
        @DisplayName("filter productBarCodeNumber + excludedIds -> should call findByCompanyCnpjAndBarcodeExcludingIds with safePageable")
        void filterProductBarCodeNumber_withExcludedIds_callsFindByCompanyCnpjAndBarcodeExcludingIds() {
            String field = "productBarCodeNumber";
            String value = "1234567890";

            List<Long> excludedIds = List.of(1L, 2L);

            Page<Product> repoPage = productPage();
            stubMapperFor(repoPage);

            ArgumentCaptor<Pageable> captor = pageableArgumentCaptor();
            when(productRepository.findByCompanyCnpjAndBarcodeExcludingIds(eq(CNPJ), eq(value), eq(excludedIds), captor.capture())).thenReturn(repoPage);

            ResponseEntity<Page<ProductResponseDTO>> result = productService.getProductsByCompanyCnpj(CNPJ, pageable, field, value, excludedIds);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();
            assertThat(result.getBody().getTotalElements()).isEqualTo(2);
            assertThat(result.getBody().getContent()).hasSize(2);

            Pageable used = captor.getValue();
            assertThat(used.getPageNumber()).isEqualTo(0);
            assertThat(used.getPageSize()).isEqualTo(5);
            assertThat(used.getSort()).isEqualTo(pageable.getSort());

            verify(productRepository, times(1)).findByCompanyCnpjAndBarcodeExcludingIds(eq(CNPJ), eq(value), eq(excludedIds), any(Pageable.class));
            verify(productMapper, times(2)).toDto(any(Product.class));
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(productRepository, productMapper);
        }

        @Test
        @DisplayName("filter productBarCodeNumber + no excludedIds -> should call findByCompany_CompanyCnpjAndProductBarCodeNumberContainsIgnoreCase with safePageable")
        void filterProductBarCodeNumber_noExcludedIds_callsFindByCompany_CompanyCnpjAndProductBarCodeNumberContainsIgnoreCase() {
            String field = "productBarCodeNumber";
            String value = "1234567890";

            Page<Product> repoPage = productPage();
            stubMapperFor(repoPage);

            ArgumentCaptor<Pageable> captor = pageableArgumentCaptor();
            when(productRepository.findByCompany_CompanyCnpjAndProductBarCodeNumberContainsIgnoreCase(eq(CNPJ), eq(value), captor.capture())).thenReturn(repoPage);

            ResponseEntity<Page<ProductResponseDTO>> result = productService.getProductsByCompanyCnpj(CNPJ, pageable, field, value, null);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();
            assertThat(result.getBody().getTotalElements()).isEqualTo(2);
            assertThat(result.getBody().getContent()).hasSize(2);

            Pageable used = captor.getValue();
            assertThat(used.getPageNumber()).isEqualTo(0);
            assertThat(used.getPageSize()).isEqualTo(5);
            assertThat(used.getSort()).isEqualTo(pageable.getSort());

            verify(productRepository, times(1)).findByCompany_CompanyCnpjAndProductBarCodeNumberContainsIgnoreCase(eq(CNPJ), eq(value), any(Pageable.class));
            verify(productMapper, times(2)).toDto(any(Product.class));
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(productRepository, productMapper);
        }

        @Test
        @DisplayName("filter productName + excludedIds -> should call findByCompanyCnpjAndNameExcludingIds with safePageable")
        void filterProductName_withExcludedIds_callsFindByCompanyCnpjAndNameExcludingIds() {
            String field = "productName";
            String value = "bottle";

            List<Long> excludedIds = List.of(1L, 2L);

            Page<Product> repoPage = productPage();
            stubMapperFor(repoPage);

            ArgumentCaptor<Pageable> captor = pageableArgumentCaptor();
            when(productRepository.findByCompanyCnpjAndNameExcludingIds(eq(CNPJ), eq(value), eq(excludedIds), captor.capture())).thenReturn(repoPage);

            ResponseEntity<Page<ProductResponseDTO>> result = productService.getProductsByCompanyCnpj(CNPJ, pageable, field, value, excludedIds);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();
            assertThat(result.getBody().getTotalElements()).isEqualTo(2);
            assertThat(result.getBody().getContent()).hasSize(2);

            Pageable used = captor.getValue();
            assertThat(used.getPageNumber()).isEqualTo(0);
            assertThat(used.getPageSize()).isEqualTo(5);
            assertThat(used.getSort()).isEqualTo(pageable.getSort());

            verify(productRepository, times(1)).findByCompanyCnpjAndNameExcludingIds(eq(CNPJ), eq(value), eq(excludedIds), any(Pageable.class));
            verify(productMapper, times(2)).toDto(any(Product.class));
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(productRepository, productMapper);
        }

        @Test
        @DisplayName("filter productName + no excludedIds -> should call findByCompany_CompanyCnpjAndProductNameContainsIgnoreCase with safePageable")
        void filterProductName_noExcludedIds_callsFindByCompany_CompanyCnpjAndProductNameContainsIgnoreCase() {
            String field = "productName";
            String value = "bottle";

            Page<Product> repoPage = productPage();
            stubMapperFor(repoPage);

            ArgumentCaptor<Pageable> captor = pageableArgumentCaptor();
            when(productRepository.findByCompany_CompanyCnpjAndProductNameContainsIgnoreCase(eq(CNPJ), eq(value), captor.capture())).thenReturn(repoPage);

            ResponseEntity<Page<ProductResponseDTO>> result = productService.getProductsByCompanyCnpj(CNPJ, pageable, field, value, null);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();
            assertThat(result.getBody().getTotalElements()).isEqualTo(2);
            assertThat(result.getBody().getContent()).hasSize(2);

            Pageable used = captor.getValue();
            assertThat(used.getPageNumber()).isEqualTo(0);
            assertThat(used.getPageSize()).isEqualTo(5);
            assertThat(used.getSort()).isEqualTo(pageable.getSort());

            verify(productRepository, times(1)).findByCompany_CompanyCnpjAndProductNameContainsIgnoreCase(eq(CNPJ), eq(value), any(Pageable.class));
            verify(productMapper, times(2)).toDto(any(Product.class));
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(productRepository, productMapper);
        }

        @Test
        @DisplayName("blank value should be treated as no filter at GetProductsByCompanyCnpj")
        void blankValue_treatedAsNoFilterAtGetProductsByCompanyCnpj() {
            String field = "productName";
            String value = "  ";

            Page<Product> repoPage = productPage();
            stubMapperFor(repoPage);

            ArgumentCaptor<Pageable> captor = pageableArgumentCaptor();
            when(productRepository.findByCompany_CompanyCnpj(eq(CNPJ), captor.capture())).thenReturn(repoPage);

            ResponseEntity<Page<ProductResponseDTO>> result = productService.getProductsByCompanyCnpj(CNPJ, pageable, field, value, null);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();
            assertThat(result.getBody().getTotalElements()).isEqualTo(2);
            assertThat(result.getBody().getContent()).hasSize(2);

            Pageable used = captor.getValue();
            assertThat(used.getPageNumber()).isEqualTo(0);
            assertThat(used.getPageSize()).isEqualTo(5);
            assertThat(used.getSort()).isEqualTo(pageable.getSort());

            verify(productRepository, times(1)).findByCompany_CompanyCnpj(eq(CNPJ), any(Pageable.class));
            verify(productMapper, times(2)).toDto(any(Product.class));
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(productRepository, productMapper);
        }

        @Test
        @DisplayName("null value should be treated as no filter at GetProductsByCompanyCnpj")
        void nullValue_treatedAsNoFilterAtGetProductsByCompanyCnpj() {
            String field = "productName";
            String value = null;

            Page<Product> repoPage = productPage();
            stubMapperFor(repoPage);

            ArgumentCaptor<Pageable> captor = pageableArgumentCaptor();
            when(productRepository.findByCompany_CompanyCnpj(eq(CNPJ), captor.capture())).thenReturn(repoPage);

            ResponseEntity<Page<ProductResponseDTO>> result = productService.getProductsByCompanyCnpj(CNPJ, pageable, field, value, null);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();
            assertThat(result.getBody().getTotalElements()).isEqualTo(2);
            assertThat(result.getBody().getContent()).hasSize(2);

            Pageable used = captor.getValue();
            assertThat(used.getPageNumber()).isEqualTo(0);
            assertThat(used.getPageSize()).isEqualTo(5);
            assertThat(used.getSort()).isEqualTo(pageable.getSort());

            verify(productRepository, times(1)).findByCompany_CompanyCnpj(eq(CNPJ), any(Pageable.class));
            verify(productMapper, times(2)).toDto(any(Product.class));
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(productRepository, productMapper);
        }

        @Test
        @DisplayName("invalid field -> should throw ResourceNotFoundException at GetProductsByCompanyCnpj")
        void invalidField_throwsResourceNotFoundExceptionAtGetProductsByCompanyCnpj() {
            String field = "productNamee";
            String value = "botttle";

            assertThatThrownBy(() -> productService.getProductsByCompanyCnpj(CNPJ, pageable, field, value, null))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Invalid field");

            verifyNoInteractions(companyRepository, productMapper, productRepository);
        }
    }

    @Nested
    class UpdateProductById {

        private Long id;
        private String companyCnpj;

        @BeforeEach
        void setUpUpdateProductById() {
            id = product.getId();
            companyCnpj = productRequestDTO.getCompanyCnpj();
        }


        @Test
        @DisplayName("should update product and return 201 when product exists and values are valids")
        void shouldUpdateProductSuccessfullyAndReturnCreated() {
            when(productRepository.findById(id)).thenReturn(Optional.of(product));

            ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);

            when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
            when(productMapper.toDto(any(Product.class))).thenReturn(productResponseDTO);

            ResponseEntity<ProductResponseDTO> result = productService.updateProductById(productRequestDTO, id);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(result.getBody()).isNotNull();

            verify(productRepository).save(captor.capture());
            Product saved = captor.getValue();

            assertThat(saved.getProductName()).isEqualTo(productRequestDTO.getProductName());
            assertThat(saved.getProductBarCodeNumber()).isEqualTo(productRequestDTO.getProductBarCodeNumber());
            assertThat(saved.getUnitOfMeasure()).isEqualTo(productRequestDTO.getUnitOfMeasure());
            assertThat(saved.getCompany().getCompanyCnpj()).isEqualTo(companyCnpj);

            verify(productRepository, times(1)).findById(id);
            verify(productMapper, times(1)).toDto(any(Product.class));
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(productRepository, productMapper);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when product id doesn't exist")
        void shouldThrowWhenProductIdDoesntExist() {
            when(productRepository.findById(id)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> productService.updateProductById(productRequestDTO, id))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Product with id " + id + " does not exists");

            verify(productRepository, times(1)).findById(id);
            verifyNoInteractions(companyRepository, productMapper);
            verifyNoMoreInteractions(productRepository);
        }

        @Test
        @DisplayName("should throw ImmutableResourceException when companyCnpj is changed")
        void shouldThrowWhenCompanyCnpjChangedAtUpdateProductById() {
            when(productRepository.findById(id)).thenReturn(Optional.of(product));
            ProductRequestDTO otherProductRequestDTO = new ProductRequestDTO("Product A", "10", UnitOfMeasure.kg, "00000000000000");

            assertThatThrownBy(() -> productService.updateProductById(otherProductRequestDTO, id))
                    .isInstanceOf(ImmutableResourceException.class)
                    .hasMessage("Company CNPJ cannot be changed");

            verify(productRepository, times(1)).findById(id);
            verifyNoInteractions(companyRepository, productMapper);
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

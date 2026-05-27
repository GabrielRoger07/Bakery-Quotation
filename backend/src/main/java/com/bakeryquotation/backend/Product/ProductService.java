package com.bakeryquotation.backend.Product;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Department.Department;
import com.bakeryquotation.backend.Product.DTO.ProductRequestDTO;
import com.bakeryquotation.backend.Product.DTO.ProductResponseDTO;
import com.bakeryquotation.backend.Product.mapper.ProductMapper;
import com.bakeryquotation.backend.Department.DepartmentRepository;
import com.bakeryquotation.backend.exception.AccessDeniedException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final DepartmentRepository departmentRepository;

    public ProductService(ProductRepository productRepository, ProductMapper productMapper, CompanyRepository companyRepository, DepartmentRepository departmentRepository){
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
    }

    public ResponseEntity<ProductResponseDTO> getProductById(Long id){
        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " does not exists"));
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if(!email.equals(product.getCompany().getCompanyEmail())) {
            throw new AccessDeniedException("You do not have permission to perform this action. Nice try");
        }
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

    public ResponseEntity<Page<ProductResponseDTO>> getProductsByCompanyEmail(Pageable pageable, String field, String value, List<Long> excludedIds, Long departmentId){
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Pageable safePageable = PageRequest.of(pageable.getPageNumber(), pageSize, pageable.getSort());
        Page<Product> productsByCompany;

        boolean applyFilter = field != null && value != null && !value.isBlank();
        boolean hasExcludedIds = excludedIds != null && !excludedIds.isEmpty();
        boolean hasDeptFilter = departmentId != null;

        if(hasDeptFilter){
            if(applyFilter && field.equals("productName")){
                if(hasExcludedIds){
                    productsByCompany = productRepository.findByCompanyEmailAndDepartmentAndNameExcludingIds(companyEmail, departmentId, value, excludedIds, safePageable);
                } else {
                    productsByCompany = productRepository.findByCompanyEmailAndDepartmentAndName(companyEmail, departmentId, value, safePageable);
                }
            } else {
                if(hasExcludedIds){
                    productsByCompany = productRepository.findByCompanyEmailAndDepartmentExcludingIds(companyEmail, departmentId, excludedIds, safePageable);
                } else {
                    productsByCompany = productRepository.findByCompanyEmailAndDepartment(companyEmail, departmentId, safePageable);
                }
            }
        } else if(applyFilter){
            if(field.equals("productBarCodeNumber")){
                if(hasExcludedIds){
                    productsByCompany = productRepository.findByCompanyEmailAndBarcodeExcludingIds(companyEmail, value, excludedIds, safePageable);
                } else {
                    productsByCompany = productRepository.findByCompany_CompanyEmailAndProductBarCodeNumberContainsIgnoreCase(companyEmail, value, safePageable);
                }
            } else if(field.equals("productName")){
                if(hasExcludedIds){
                    productsByCompany = productRepository.findByCompanyEmailAndNameExcludingIds(companyEmail, value, excludedIds, safePageable);
                } else {
                    productsByCompany = productRepository.findByCompany_CompanyEmailAndProductNameContainsIgnoreCase(companyEmail, value, safePageable);
                }
            } else {
                throw new ResourceNotFoundException("Invalid field");
            }
        } else {
            if(hasExcludedIds) {
                productsByCompany = productRepository.findByCompanyEmailExcludingIds(companyEmail, excludedIds, safePageable);
            } else {
                productsByCompany = productRepository.findByCompany_CompanyEmail(companyEmail, safePageable);
            }
        }

        Page<ProductResponseDTO> productsResponseDTOByCompany = productsByCompany.map(productMapper::toDto);
        return ResponseEntity.status(HttpStatus.OK).body(productsResponseDTOByCompany);
    }

    public ResponseEntity<ProductResponseDTO> createProduct(ProductRequestDTO productRequestDTO){
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Company company = companyRepository.findByCompanyEmail(companyEmail).orElseThrow(() -> new ResourceNotFoundException("Company with email " + companyEmail + " does not exists"));

        Product product = productMapper.toEntity(productRequestDTO);

        List<Department> departments = departmentRepository.findByCompany_CompanyEmail(companyEmail);

        if(departments.isEmpty()) {
            throw new ResourceNotFoundException("This company does not have any registered department");
        } else if (departments.size() == 1) {
            product.setDepartment(departments.getFirst());
        } else {
            Department department = departments.stream()
                    .filter(dep -> dep.getId().equals(productRequestDTO.getDepartmentId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

            product.setDepartment(department);
        }

        product.setCompany(company);

        Product productSaved = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(productMapper.toDto(productSaved));
    }

    public ResponseEntity<ProductResponseDTO> updateProductById(ProductRequestDTO productRequestDTO, Long id){
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " does not exists"));

        if(!companyEmail.equals(product.getCompany().getCompanyEmail())) {
            throw new AccessDeniedException("You do not have permission to perform this action. Nice try");
        }

        List<Department> departments = departmentRepository.findByCompany_CompanyEmail(companyEmail);

        if(departments.size() > 1) {
            Department department = departments.stream()
                    .filter(dep -> dep.getId().equals(productRequestDTO.getDepartmentId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

            product.setDepartment(department);
        }

        product.setProductName(productRequestDTO.getProductName());
        product.setProductBarCodeNumber(productRequestDTO.getProductBarCodeNumber());
        product.setProductDescription(productRequestDTO.getProductDescription());
        Product productUpdated = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(productMapper.toDto(productUpdated));
    }

    public ResponseEntity<ProductResponseDTO> deleteProductById(Long id){
        String companyEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " does not exists"));
        if(!companyEmail.equals(product.getCompany().getCompanyEmail())) {
            throw new AccessDeniedException("You do not have permission to perform this action. Nice try");
        }
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

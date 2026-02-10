package com.bakeryquotation.backend.Supplier;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Supplier.DTO.SupplierRequestDTO;
import com.bakeryquotation.backend.Supplier.DTO.SupplierResponseDTO;
import com.bakeryquotation.backend.Supplier.mapper.SupplierMapper;
import com.bakeryquotation.backend.exception.DuplicateResourceException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
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

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private SupplierMapper supplierMapper;

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private SupplierService supplierService;

    private Company company;
    private Supplier supplier;
    private SupplierResponseDTO supplierResponseDTO;
    private SupplierRequestDTO supplierRequestDTO;
    private static final Long SUPPLIER_ID = 10L;

    @BeforeEach
    void setUp() {
        company = new Company("12345678901234", "Bakery", "11999999999", "bakery@email.com", "secret");
        LocalDateTime createdAt = LocalDateTime.of(2026, 2, 9, 9, 10, 0);
        supplier = new Supplier(SUPPLIER_ID, "Supplier A", "supplier@email.com", "11988888888", "Employer LTDA", "43210987654321", createdAt, company, null);
        supplierRequestDTO = new SupplierRequestDTO("Supplier A", "supplier@email.com", "11988888888", "Employer LTDA", "43210987654321", company.getCompanyCnpj());
        supplierResponseDTO = new SupplierResponseDTO(SUPPLIER_ID, "Supplier A", "supplier@email.com", "11988888888", "Employer LTDA", "43210987654321", company.getCompanyCnpj(), createdAt);
    }

    @Nested
    class GetSupplierById {

        @Test
        @DisplayName("should return 200 OK with SupplierResponseDTO when supplier exists")
        void shouldReturnOkWhenSupplierExists() {
            when(supplierRepository.findById(SUPPLIER_ID)).thenReturn(Optional.of(supplier));
            when(supplierMapper.toDto(supplier)).thenReturn(supplierResponseDTO);

            ResponseEntity<SupplierResponseDTO> result = supplierService.getSupplierById(SUPPLIER_ID);

            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();
            // assertThat(result.getBody()).isSameAs(supplierResponseDTO);

            assertThat(SUPPLIER_ID).isEqualTo(result.getBody().getSupplierId());
            assertThat(supplier.getSupplierName()).isEqualTo(result.getBody().getSupplierName());
            assertThat(supplier.getSupplierEmail()).isEqualTo(result.getBody().getSupplierEmail());
            assertThat(supplier.getSupplierWhatsappNumber()).isEqualTo(result.getBody().getSupplierWhatsappNumber());
            assertThat(supplier.getEmployerName()).isEqualTo(result.getBody().getEmployerName());
            assertThat(supplier.getEmployerCnpj()).isEqualTo(result.getBody().getEmployerCnpj());
            assertThat(supplier.getCompany().getCompanyCnpj()).isEqualTo(result.getBody().getCompanyCnpj());
            assertThat(result.getBody().getCreatedAt()).isNotNull();

            verify(supplierRepository, times(1)).findById(SUPPLIER_ID);
            verify(supplierMapper, times(1)).toDto(supplier);
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(supplierRepository, supplierMapper);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when supplier doesn't exists")
        void shouldThrowResourceNotFoundExceptionWhenSupplierDoesntExists() {
            Long missingId = 11L;

            // Não coloquei thenThrow porque quem lança a exceção é o service, não o repository
            when(supplierRepository.findById(missingId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> supplierService.getSupplierById(missingId))
                    .isInstanceOf(ResourceNotFoundException.class)
                            .hasMessage("Supplier with id " + missingId + " does not exists");

            verify(supplierRepository, times(1)).findById(missingId);
            verifyNoInteractions(supplierMapper);
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(supplierRepository);
        }
    }

    @Nested
    class GetAllSuppliers {

        @Test
        @DisplayName("should return 200 OK with a list of SupplierResponseDTO when suppliers exist")
        void shouldReturnOkWithListWhenSuppliersExist() {
            Supplier supplier1 = supplier;
            Supplier supplier2 = new Supplier(20L, "Supplier B", "supplier2@email.com", "11977777777", "Employer SA", "09876543210987", LocalDateTime.of(2026, 2, 9, 10, 0, 0), supplier1.getCompany(), null);
            SupplierResponseDTO supplierResponseDTO1 = supplierResponseDTO;
            SupplierResponseDTO supplierResponseDTO2 = new SupplierResponseDTO(20L, "Supplier B", "supplier2@email.com", "11977777777", "Employer SA", "09876543210987", supplier1.getCompany().getCompanyCnpj(), supplier2.getCreatedAt());

            when(supplierRepository.findAll()).thenReturn(List.of(supplier1, supplier2));
            when(supplierMapper.toDto(supplier1)).thenReturn(supplierResponseDTO1);
            when(supplierMapper.toDto(supplier2)).thenReturn(supplierResponseDTO2);

            ResponseEntity<List<SupplierResponseDTO>> result = supplierService.getAllSuppliers();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(2)
                    .containsExactly(supplierResponseDTO1, supplierResponseDTO2);

            verify(supplierRepository, times(1)).findAll();
            verify(supplierMapper, times(1)).toDto(supplier1);
            verify(supplierMapper, times(1)).toDto(supplier2);
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(supplierRepository, supplierMapper);
        }

        @Test
        @DisplayName("should return 200 OK with an empty list when no suppliers exist")
        void shouldReturnOkWithEmptyListWhenNoSuppliersExist() {
            when(supplierRepository.findAll()).thenReturn(List.of());

            ResponseEntity<List<SupplierResponseDTO>> result = supplierService.getAllSuppliers();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(0)
                    .isEmpty();

            verify(supplierRepository, times(1)).findAll();
            verifyNoInteractions(supplierMapper);
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(supplierRepository);
        }
    }

    @Nested
    class CreateSupplier {

        @Test
        @DisplayName("should create a supplier and return 201 created")
        void shouldReturnCreatedWhenSupplierCreatedSuccessfully() {
            String companyCnpj = company.getCompanyCnpj();
            when(companyRepository.findById(companyCnpj)).thenReturn(Optional.of(company));

            when(supplierRepository.findByCompany_CompanyCnpjAndSupplierEmail(companyCnpj, supplierRequestDTO.getSupplierEmail())).thenReturn(Optional.empty());
            when(supplierRepository.findByCompany_CompanyCnpjAndSupplierWhatsappNumber(companyCnpj, supplierRequestDTO.getSupplierWhatsappNumber())).thenReturn(Optional.empty());

            when(supplierMapper.toEntity(supplierRequestDTO)).thenReturn(supplier);
            when(supplierMapper.toDto(supplier)).thenReturn(supplierResponseDTO);
            when(supplierRepository.save(supplier)).thenReturn(supplier);

            ResponseEntity<SupplierResponseDTO> result = supplierService.createSupplier(supplierRequestDTO);

            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(result.getBody()).isNotNull();
            // assertThat(result.getBody()).isSameAs(supplierResponseDTO);

            assertThat(result.getBody().getSupplierName()).isEqualTo(supplierResponseDTO.getSupplierName());
            assertThat(result.getBody().getSupplierEmail()).isEqualTo(supplierResponseDTO.getSupplierEmail());
            assertThat(result.getBody().getSupplierWhatsappNumber()).isEqualTo(supplierResponseDTO.getSupplierWhatsappNumber());
            assertThat(result.getBody().getEmployerName()).isEqualTo(supplierResponseDTO.getEmployerName());
            assertThat(result.getBody().getCompanyCnpj()).isEqualTo(supplierResponseDTO.getCompanyCnpj());
            assertThat(result.getBody().getCreatedAt()).isNotNull();

            verify(companyRepository, times(1)).findById(companyCnpj);
            verify(supplierRepository, times(1)).findByCompany_CompanyCnpjAndSupplierEmail(companyCnpj, supplierRequestDTO.getSupplierEmail());
            verify(supplierRepository, times(1)).findByCompany_CompanyCnpjAndSupplierWhatsappNumber(companyCnpj, supplierRequestDTO.getSupplierWhatsappNumber());
            verify(supplierMapper, times(1)).toEntity(supplierRequestDTO);
            verify(supplierRepository, times(1)).save(supplier);
            verify(supplierMapper, times(1)).toDto(supplier);
            verifyNoMoreInteractions(supplierRepository, supplierMapper, companyRepository);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when company doesn't exists")
        void shouldThrowResourceNotFoundExceptionWhenCompanyDoesntExists() {
            String companyCnpj = company.getCompanyCnpj();
            when(companyRepository.findById(companyCnpj)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> supplierService.createSupplier(supplierRequestDTO))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Company with CNPJ " + companyCnpj + " does not exists");

            verify(companyRepository, times(1)).findById(companyCnpj);
            verifyNoInteractions(supplierRepository);
            verifyNoInteractions(supplierMapper);
            verifyNoMoreInteractions(companyRepository);
        }
    }

    @Nested
    class DeleteSupplierById {

        @Test
        @DisplayName("should return 200 OK with SupplierResponseDTO and exclude supplier when supplier exists")
        void shouldReturnOkWhenDeleteSupplierSuccessfully() {
            when(supplierRepository.findById(SUPPLIER_ID)).thenReturn(Optional.of(supplier));
            when(supplierMapper.toDto(supplier)).thenReturn(supplierResponseDTO);

            ResponseEntity<SupplierResponseDTO> result = supplierService.deleteSupplierById(SUPPLIER_ID);

            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();

            assertThat(result.getBody().getSupplierId()).isEqualTo(SUPPLIER_ID);
            assertThat(result.getBody().getSupplierName()).isEqualTo(supplier.getSupplierName());
            assertThat(result.getBody().getSupplierEmail()).isEqualTo(supplier.getSupplierEmail());
            assertThat(result.getBody().getSupplierWhatsappNumber()).isEqualTo(supplier.getSupplierWhatsappNumber());
            assertThat(result.getBody().getEmployerName()).isEqualTo(supplier.getEmployerName());
            assertThat(result.getBody().getEmployerCnpj()).isEqualTo(supplier.getEmployerCnpj());
            assertThat(result.getBody().getCompanyCnpj()).isEqualTo(supplier.getCompany().getCompanyCnpj());
            assertThat(result.getBody().getCreatedAt()).isNotNull();

            verify(supplierRepository, times(1)).findById(SUPPLIER_ID);
            verify(supplierMapper, times(1)).toDto(supplier);
            verify(supplierRepository, times(1)).delete(supplier);
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(supplierRepository, supplierMapper);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException and not delete supplier when supplier doesn't exists")
        void shouldThrowResourceNotFoundExceptionAndNotDeleteSupplierWhenSupplierDoesntExists() {
            Long missingId = 11L;

            // Não coloquei thenThrow porque quem lança a exceção é o service, não o repository
            when(supplierRepository.findById(missingId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> supplierService.getSupplierById(missingId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Supplier with id " + missingId + " does not exists");

            verify(supplierRepository, times(1)).findById(missingId);
            verify(supplierRepository, never()).delete(supplier);
            verifyNoInteractions(supplierMapper);
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(supplierRepository);
        }
    }

    @Nested
    class DeleteAllSuppliers {

        @Test
        @DisplayName("should return 200 OK with a list of SupplierResponseDTO and delete suppliers when suppliers exist")
        void shouldReturnOkWithListAndDeleteAllSuppliersWhenSuppliersExist() {
            Supplier supplier1 = supplier;
            Supplier supplier2 = new Supplier(20L, "Supplier B", "supplier2@email.com", "11977777777", "Employer SA", "09876543210987", LocalDateTime.of(2026, 2, 9, 10, 0, 0), supplier1.getCompany(), null);
            SupplierResponseDTO supplierResponseDTO1 = supplierResponseDTO;
            SupplierResponseDTO supplierResponseDTO2 = new SupplierResponseDTO(20L, "Supplier B", "supplier2@email.com", "11977777777", "Employer SA", "09876543210987", supplier1.getCompany().getCompanyCnpj(), supplier2.getCreatedAt());

            when(supplierRepository.findAll()).thenReturn(List.of(supplier1, supplier2));
            when(supplierMapper.toDto(supplier1)).thenReturn(supplierResponseDTO1);
            when(supplierMapper.toDto(supplier2)).thenReturn(supplierResponseDTO2);

            ResponseEntity<List<SupplierResponseDTO>> result = supplierService.deleteAllSuppliers();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(2)
                    .containsExactly(supplierResponseDTO1, supplierResponseDTO2);

            verify(supplierRepository, times(1)).findAll();
            verify(supplierMapper, times(1)).toDto(supplier1);
            verify(supplierMapper, times(1)).toDto(supplier2);
            verify(supplierRepository, times(1)).deleteAll();
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(supplierRepository, supplierMapper);
        }

        @Test
        @DisplayName("should return 200 OK with an empty list and try to delete supplier when no suppliers exist")
        void shouldReturnOkWithEmptyListAndTryToDeleteSupplierWhenNoSuppliersExist() {
            when(supplierRepository.findAll()).thenReturn(List.of());

            ResponseEntity<List<SupplierResponseDTO>> result = supplierService.deleteAllSuppliers();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(0)
                    .isEmpty();

            verify(supplierRepository, times(1)).findAll();
            verifyNoInteractions(supplierMapper);
            verify(supplierRepository, never()).deleteAll();
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(supplierRepository);
        }
    }

    @Nested
    class Validation {

        private String companyCnpj;
        private String email;
        private String whatsappNumber;

        @BeforeEach
        void setUpValidation() {
            companyCnpj = supplierRequestDTO.getCompanyCnpj();
            email = supplierRequestDTO.getSupplierEmail();
            whatsappNumber = supplierRequestDTO.getSupplierWhatsappNumber();
        }

        @Test
        @DisplayName("should not throw when email and whatsapp number are not duplicated")
        void shouldNotThrowWhenNoDuplicates() {
            when(supplierRepository.findByCompany_CompanyCnpjAndSupplierEmail(companyCnpj, email)).thenReturn(Optional.empty());
            when(supplierRepository.findByCompany_CompanyCnpjAndSupplierWhatsappNumber(companyCnpj, whatsappNumber)).thenReturn(Optional.empty());

            assertThatCode(() -> supplierService.validation(supplierRequestDTO))
                    .doesNotThrowAnyException();

            verify(supplierRepository, times(1)).findByCompany_CompanyCnpjAndSupplierEmail(companyCnpj, email);
            verify(supplierRepository, times(1)).findByCompany_CompanyCnpjAndSupplierWhatsappNumber(companyCnpj, whatsappNumber);
            verifyNoMoreInteractions(supplierRepository);
            verifyNoInteractions(supplierMapper, companyRepository);
        }

        @Test
        @DisplayName("should throw DuplicateResourceException when email is duplicated and not check whatsapp number")
        void shouldThrowWhenEmailDuplicated() {
            when(supplierRepository.findByCompany_CompanyCnpjAndSupplierEmail(companyCnpj, email)).thenReturn(Optional.of(supplier));

            assertThatThrownBy(() -> supplierService.validation(supplierRequestDTO))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessage("This company already has a supplier with email " + email);

            verify(supplierRepository, times(1)).findByCompany_CompanyCnpjAndSupplierEmail(companyCnpj, email);
            verify(supplierRepository, never()).findByCompany_CompanyCnpjAndSupplierWhatsappNumber(companyCnpj, whatsappNumber);
            verifyNoMoreInteractions(supplierRepository);
            verifyNoInteractions(supplierMapper, companyRepository);
        }

        @Test
        @DisplayName("should throw DuplicateResourceException when whatsapp number is duplicated and email is free")
        void shouldThrowWhenWhatsappNumberDuplicated() {
            when(supplierRepository.findByCompany_CompanyCnpjAndSupplierEmail(companyCnpj, email)).thenReturn(Optional.empty());
            when(supplierRepository.findByCompany_CompanyCnpjAndSupplierWhatsappNumber(companyCnpj, whatsappNumber)).thenReturn(Optional.of(supplier));

            assertThatThrownBy(() -> supplierService.validation(supplierRequestDTO))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessage("This company already has a supplier with Whatsapp number " + whatsappNumber);

            verify(supplierRepository, times(1)).findByCompany_CompanyCnpjAndSupplierEmail(companyCnpj, email);
            verify(supplierRepository, times(1)).findByCompany_CompanyCnpjAndSupplierWhatsappNumber(companyCnpj, whatsappNumber);
            verifyNoMoreInteractions(supplierRepository);
            verifyNoInteractions(supplierMapper, companyRepository);
        }
    }
}
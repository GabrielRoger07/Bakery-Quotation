package com.bakeryquotation.backend.Quotation;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Product.DTO.ProductRequestDTO;
import com.bakeryquotation.backend.Product.DTO.ProductResponseDTO;
import com.bakeryquotation.backend.Product.Product;
import com.bakeryquotation.backend.Product.UnitOfMeasure;
import com.bakeryquotation.backend.Quotation.DTO.QuotationRequestDTO;
import com.bakeryquotation.backend.Quotation.DTO.QuotationResponseDTO;
import com.bakeryquotation.backend.Quotation.mapper.QuotationMapper;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.verifyNoMoreInteractions;

@ExtendWith(MockitoExtension.class)
public class QuotationServiceTest {

    @Mock
    private QuotationRepository quotationRepository;

    @Mock
    private QuotationMapper quotationMapper;

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private QuotationService quotationService;

    private Company company;
    private Quotation quotation;
    private QuotationRequestDTO quotationRequestDTO;
    private QuotationResponseDTO quotationResponseDTO;
    private static final Long QUOTATION_ID = 10L;

    @BeforeEach
    void setUp() {
        company = new Company("12345678901234", "Bakery", "11999999999", "bakery@email.com", "secret");
        LocalDateTime quotationStart = LocalDateTime.of(2026, 1, 1, 14, 0, 0);
        LocalDateTime quotationEnd = LocalDateTime.of(2026, 1, 2, 14, 0, 0);
        LocalDateTime createdAt = LocalDateTime.of(2026, 1, 1, 9, 10, 0);
        quotation = new Quotation(QUOTATION_ID, quotationStart, quotationEnd, createdAt, company, null, null);
        quotationRequestDTO = new QuotationRequestDTO(quotationStart, quotationEnd, company.getCompanyCnpj());
        quotationResponseDTO = new QuotationResponseDTO(QUOTATION_ID, quotationStart, quotationEnd, company.getCompanyCnpj(), createdAt);
    }

    @Nested
    public class GetQuotationById {

        @Test
        @DisplayName("should return 200 OK with QuotationResponseDTO when quotation exists")
        void shouldReturnOkWhenQuotationExists() {
            when(quotationRepository.findById(QUOTATION_ID)).thenReturn(Optional.of(quotation));
            when(quotationMapper.toDto(quotation)).thenReturn(quotationResponseDTO);

            ResponseEntity<QuotationResponseDTO> result = quotationService.getQuotationById(QUOTATION_ID);

            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();
            // assertThat(result.getBody()).isSameAs(productResponseDTO);

            assertThat(result.getBody().getQuotationId()).isEqualTo(QUOTATION_ID);
            assertThat(result.getBody().getQuotationStart()).isEqualTo(quotation.getQuotationStart());
            assertThat(result.getBody().getQuotationEnd()).isEqualTo(quotation.getQuotationEnd());
            assertThat(result.getBody().getCompanyCnpj()).isEqualTo(quotation.getCompany().getCompanyCnpj());
            assertThat(result.getBody().getCreatedAt()).isEqualTo(quotation.getCreatedAt());

            verify(quotationRepository, times(1)).findById(QUOTATION_ID);
            verify(quotationMapper, times(1)).toDto(quotation);
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(quotationRepository, quotationMapper);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when quotation doesn't exists")
        void shouldThrowResourceNotFoundExceptionWhenQuotationDoesntExists() {
            when(quotationRepository.findById(QUOTATION_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> quotationService.getQuotationById(QUOTATION_ID))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Quotation with id " + QUOTATION_ID + " does not exists");

            verify(quotationRepository, times(1)).findById(QUOTATION_ID);
            verifyNoInteractions(quotationMapper, companyRepository);
            verifyNoMoreInteractions(quotationRepository);
        }
    }
}

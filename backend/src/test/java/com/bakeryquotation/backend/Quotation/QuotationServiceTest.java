package com.bakeryquotation.backend.Quotation;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Quotation.DTO.QuotationRequestDTO;
import com.bakeryquotation.backend.Quotation.DTO.QuotationResponseDTO;
import com.bakeryquotation.backend.Quotation.mapper.QuotationMapper;
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

    @Nested
    class GetAllQuotations {

        @Test
        @DisplayName("should return 200 OK with a list of QuotationResponseDTO when quotations exist")
        void shouldReturnOkWithListWhenQuotationsExist() {
            Quotation quotation1 = quotation;
            LocalDateTime quotationStart2 = LocalDateTime.of(2026, 2, 1, 14, 0, 0);
            LocalDateTime quotationEnd2 = LocalDateTime.of(2026, 2, 2, 14, 0, 0);
            LocalDateTime createdAt2 = LocalDateTime.of(2026, 2, 1, 9, 10, 0);
            Quotation quotation2 = new Quotation(20L, quotationStart2, quotationEnd2, createdAt2, company, null, null);
            QuotationResponseDTO quotationResponseDTO1 = quotationResponseDTO;
            QuotationResponseDTO quotationResponseDTO2 = new QuotationResponseDTO(20L, quotationStart2, quotationEnd2, company.getCompanyCnpj(), createdAt2);

            when(quotationRepository.findAll()).thenReturn(List.of(quotation1, quotation2));
            when(quotationMapper.toDto(quotation1)).thenReturn(quotationResponseDTO1);
            when(quotationMapper.toDto(quotation2)).thenReturn(quotationResponseDTO2);

            ResponseEntity<List<QuotationResponseDTO>> result = quotationService.getAllQuotations();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(2)
                    .containsExactly(quotationResponseDTO1, quotationResponseDTO2);

            verify(quotationRepository, times(1)).findAll();
            verify(quotationMapper, times(1)).toDto(quotation1);
            verify(quotationMapper, times(1)).toDto(quotation2);
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(quotationRepository, quotationMapper);
        }

        @Test
        @DisplayName("should return 200 OK with an empty list when no quotations exist")
        void shouldReturnOkWithEmptyListWhenNoQuotationsExist() {
            when(quotationRepository.findAll()).thenReturn(List.of());

            ResponseEntity<List<QuotationResponseDTO>> result = quotationService.getAllQuotations();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(0)
                    .isEmpty();

            verify(quotationRepository, times(1)).findAll();
            verifyNoInteractions(quotationMapper, companyRepository);
            verifyNoMoreInteractions(quotationRepository);
        }
    }

    @Nested
    class GetQuotationsByCompanyCnpj {

        private static final String CNPJ = "12345678901234";
        private Pageable pageable;

        @BeforeEach
        void setUpGetQuotationsByCompanyCnpj() {
            ReflectionTestUtils.setField(quotationService, "pageSize", 5);
            pageable = PageRequest.of(0, 999, Sort.by("createdAt").descending());
        }

        private Page<Quotation> quotationPage() {
            Quotation q1 = quotation;
            Quotation q2 = new Quotation(
                    20L,
                    LocalDateTime.of(2026, 2, 1, 14, 0, 0),
                    LocalDateTime.of(2026, 2, 2, 14, 0, 0),
                    LocalDateTime.of(2026, 2, 1, 9, 10, 0),
                    company,
                    null,
                    null
            );
            return new PageImpl<>(List.of(q1, q2), PageRequest.of(0, 5, pageable.getSort()), 2);
        }

        private void stubMapperFor(Page<Quotation> quotations) {
            for (Quotation q : quotations.getContent()) {
                QuotationResponseDTO dto = new QuotationResponseDTO(
                        q.getId(),
                        q.getQuotationStart(),
                        q.getQuotationEnd(),
                        q.getCompany().getCompanyCnpj(),
                        q.getCreatedAt()
                );
                when(quotationMapper.toDto(q)).thenReturn(dto);
            }
        }

        private ArgumentCaptor<Pageable> pageableArgumentCaptor() {
            return ArgumentCaptor.forClass(Pageable.class);
        }

        @Test
        @DisplayName("should call findByCompany_CompanyCnpj with safePageable and return mapped page")
        void shouldCallFindByCompany_CompanyCnpjWithSafePageable_andReturnMappedPage() {
            Page<Quotation> repoPage = quotationPage();
            stubMapperFor(repoPage);

            ArgumentCaptor<Pageable> captor = pageableArgumentCaptor();
            when(quotationRepository.findByCompany_CompanyCnpj(eq(CNPJ), captor.capture())).thenReturn(repoPage);

            ResponseEntity<Page<QuotationResponseDTO>> result = quotationService.getQuotationsByCompanyCnpj(CNPJ, pageable);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();
            assertThat(result.getBody().getTotalElements()).isEqualTo(2);
            assertThat(result.getBody().getContent()).hasSize(2);

            Pageable used = captor.getValue();
            assertThat(used.getPageNumber()).isEqualTo(pageable.getPageNumber());
            assertThat(used.getPageSize()).isEqualTo(5);
            assertThat(used.getSort()).isEqualTo(pageable.getSort());

            verify(quotationRepository, times(1)).findByCompany_CompanyCnpj(eq(CNPJ), any(Pageable.class));
            verify(quotationMapper, times(2)).toDto(any(Quotation.class));
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(quotationRepository, quotationMapper);
        }

        @Test
        @DisplayName("should return empty page when repository returns empty page")
        void shouldReturnEmptyPageWhenNoQuotations() {
            Page<Quotation> emptyPage = Page.empty(PageRequest.of(0, 5, pageable.getSort()));

            ArgumentCaptor<Pageable> captor = pageableArgumentCaptor();
            when(quotationRepository.findByCompany_CompanyCnpj(eq(CNPJ), captor.capture())).thenReturn(emptyPage);

            ResponseEntity<Page<QuotationResponseDTO>> result = quotationService.getQuotationsByCompanyCnpj(CNPJ, pageable);

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();
            assertThat(result.getBody().getTotalElements()).isEqualTo(0);
            assertThat(result.getBody().getContent()).isEmpty();

            verify(quotationRepository, times(1)).findByCompany_CompanyCnpj(eq(CNPJ), any(Pageable.class));
            verifyNoInteractions(companyRepository, quotationMapper);
            verifyNoMoreInteractions(quotationRepository);
        }
    }

    @Nested
    class CreateQuotation {

        @Test
        @DisplayName("should create a quotation and return 201 created")
        void shouldReturnCreatedWhenQuotationCreatedSuccessfully() {
            String companyCnpj = company.getCompanyCnpj();
            when(companyRepository.findById(companyCnpj)).thenReturn(Optional.of(company));

            when(quotationMapper.toEntity(quotationRequestDTO)).thenReturn(quotation);
            when(quotationRepository.save(quotation)).thenReturn(quotation);
            when(quotationMapper.toDto(quotation)).thenReturn(quotationResponseDTO);

            ResponseEntity<QuotationResponseDTO> result = quotationService.createQuotation(quotationRequestDTO);

            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(result.getBody()).isNotNull();
            // assertThat(result.getBody()).isSameAs(productResponseDTO);

            assertThat(result.getBody().getQuotationStart()).isEqualTo(quotationResponseDTO.getQuotationStart());
            assertThat(result.getBody().getQuotationEnd()).isEqualTo(quotationResponseDTO.getQuotationEnd());
            assertThat(result.getBody().getCompanyCnpj()).isEqualTo(quotationResponseDTO.getCompanyCnpj());
            assertThat(result.getBody().getCreatedAt()).isEqualTo(quotationResponseDTO.getCreatedAt());

            verify(companyRepository, times(1)).findById(companyCnpj);
            verify(quotationMapper, times(1)).toEntity(quotationRequestDTO);
            verify(quotationRepository, times(1)).save(quotation);
            verify(quotationMapper, times(1)).toDto(quotation);
            verifyNoMoreInteractions(quotationRepository, quotationMapper, companyRepository);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when company doesn't exists at CreateQuotation")
        void shouldThrowResourceNotFoundExceptionWhenCompanyDoesntExistsAtCreateQuotation() {
            String companyCnpj = company.getCompanyCnpj();
            when(companyRepository.findById(companyCnpj)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> quotationService.createQuotation(quotationRequestDTO))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Company with CNPJ " + companyCnpj + " does not exists");

            verify(companyRepository, times(1)).findById(companyCnpj);
            verifyNoInteractions(quotationRepository, quotationMapper);
            verifyNoMoreInteractions(companyRepository);
        }
    }

    @Nested
    class DeleteQuotationById {

        @Test
        @DisplayName("should return 200 OK with QuotationResponseDTO and exclude quotation when quotation exists")
        void shouldReturnOkWhenDeleteQuotationSuccessfully() {
            when(quotationRepository.findById(QUOTATION_ID)).thenReturn(Optional.of(quotation));
            when(quotationMapper.toDto(quotation)).thenReturn(quotationResponseDTO);

            ResponseEntity<QuotationResponseDTO> result = quotationService.deleteQuotationById(QUOTATION_ID);

            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();

            assertThat(result.getBody().getQuotationId()).isEqualTo(QUOTATION_ID);
            assertThat(result.getBody().getQuotationStart()).isEqualTo(quotationResponseDTO.getQuotationStart());
            assertThat(result.getBody().getQuotationEnd()).isEqualTo(quotationResponseDTO.getQuotationEnd());
            assertThat(result.getBody().getCreatedAt()).isEqualTo(quotationResponseDTO.getCreatedAt());
            assertThat(result.getBody().getCompanyCnpj()).isEqualTo(quotationResponseDTO.getCompanyCnpj());

            verify(quotationRepository, times(1)).findById(QUOTATION_ID);
            verify(quotationMapper, times(1)).toDto(quotation);
            verify(quotationRepository, times(1)).delete(quotation);
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(quotationRepository, quotationMapper);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException and not delete quotation when quotation doesn't exists")
        void shouldThrowResourceNotFoundExceptionAndNotDeleteQuotationWhenQuotationDoesntExists() {
            when(quotationRepository.findById(QUOTATION_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> quotationService.getQuotationById(QUOTATION_ID))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Quotation with id " + QUOTATION_ID + " does not exists");

            verify(quotationRepository, times(1)).findById(QUOTATION_ID);
            verify(quotationRepository, never()).delete(quotation);
            verifyNoInteractions(quotationMapper, companyRepository);
            verifyNoMoreInteractions(quotationRepository);
        }
    }

    @Nested
    class DeleteAllQuotations {

        @Test
        @DisplayName("should return 200 OK with a list of QuotationResponseDTO and delete quotations when it exist")
        void shouldReturnOkWithListAndDeleteAllQuotationsWhenItExist() {
            Quotation quotation1 = quotation;
            LocalDateTime quotationStart2 = LocalDateTime.of(2026, 2, 1, 14, 0, 0);
            LocalDateTime quotationEnd2 = LocalDateTime.of(2026, 2, 2, 14, 0, 0);
            LocalDateTime createdAt2 = LocalDateTime.of(2026, 2, 1, 9, 10, 0);
            Quotation quotation2 = new Quotation(20L, quotationStart2, quotationEnd2, createdAt2, company, null, null);
            QuotationResponseDTO quotationResponseDTO1 = quotationResponseDTO;
            QuotationResponseDTO quotationResponseDTO2 = new QuotationResponseDTO(20L, quotationStart2, quotationEnd2, company.getCompanyCnpj(), createdAt2);

            when(quotationRepository.findAll()).thenReturn(List.of(quotation1, quotation2));
            when(quotationMapper.toDto(quotation1)).thenReturn(quotationResponseDTO1);
            when(quotationMapper.toDto(quotation2)).thenReturn(quotationResponseDTO2);

            ResponseEntity<List<QuotationResponseDTO>> result = quotationService.deleteAllQuotations();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(2)
                    .containsExactly(quotationResponseDTO1, quotationResponseDTO2);

            verify(quotationRepository, times(1)).findAll();
            verify(quotationMapper, times(1)).toDto(quotation1);
            verify(quotationMapper, times(1)).toDto(quotation2);
            verify(quotationRepository, times(1)).deleteAll();
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(quotationRepository, quotationMapper);
        }

        @Test
        @DisplayName("should return 200 OK with an empty list and try to delete quotation when it doesn't exist")
        void shouldReturnOkWithEmptyListAndTryToDeleteQuotationWhenItDoesntExist() {
            when(quotationRepository.findAll()).thenReturn(List.of());

            ResponseEntity<List<QuotationResponseDTO>> result = quotationService.deleteAllQuotations();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(0)
                    .isEmpty();

            verify(quotationRepository, times(1)).findAll();
            verifyNoInteractions(quotationMapper);
            verify(quotationRepository, never()).deleteAll();
            verifyNoInteractions(companyRepository);
            verifyNoMoreInteractions(quotationRepository);
        }
    }
}

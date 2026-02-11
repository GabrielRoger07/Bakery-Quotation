package com.bakeryquotation.backend.Participation;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Participation.DTO.ParticipationRequestDTO;
import com.bakeryquotation.backend.Participation.DTO.ParticipationResponseDTO;
import com.bakeryquotation.backend.Participation.mapper.ParticipationMapper;
import com.bakeryquotation.backend.Quotation.Quotation;
import com.bakeryquotation.backend.Quotation.QuotationRepository;
import com.bakeryquotation.backend.Supplier.Supplier;
import com.bakeryquotation.backend.Supplier.SupplierRepository;
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

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ParticipationServiceTest {

    @Mock
    private ParticipationRepository participationRepository;

    @Mock
    private ParticipationMapper participationMapper;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private QuotationRepository quotationRepository;

    @InjectMocks
    private ParticipationService participationService;

    private Company company;
    private Supplier supplier;
    private Quotation quotation;
    private Participation participation;
    private ParticipationRequestDTO participationRequestDTO;
    private ParticipationResponseDTO participationResponseDTO;
    private static final Long SUPPLIER_ID = 2L;
    private static final Long QUOTATION_ID = 3L;
    private static final Long PARTICIPATION_ID = 1L;

    @BeforeEach
    void setUp() {
        company = new Company("12345678901234", "Bakery", "11999999999", "bakery@email.com", "secret");
        LocalDateTime quotationStart = LocalDateTime.of(2026, 1, 1, 14, 0, 0);
        LocalDateTime quotationEnd = LocalDateTime.of(2026, 1, 2, 14, 0, 0);
        LocalDateTime createdAt = LocalDateTime.of(2026, 1, 1, 9, 10, 0);
        supplier = new Supplier(SUPPLIER_ID, "Supplier A", "supplier@email.com", "11988888888", "Employer LTDA", "43210987654321", createdAt, company, null);
        quotation = new Quotation(QUOTATION_ID, quotationStart, quotationEnd, createdAt, company, null, null);
        participation = new Participation(PARTICIPATION_ID, quotation, supplier, "accessToken", null);
        participationRequestDTO = new ParticipationRequestDTO(supplier.getId(), quotation.getId());
        participationResponseDTO = new ParticipationResponseDTO(PARTICIPATION_ID, "accessToken", supplier.getId(), quotation.getId(), supplier.getSupplierName(), supplier.getEmployerName());
    }

    @Nested
    class GetParticipationById {

        @Test
        @DisplayName("should return 200 OK with ParticipationResponseDTO when participation exists")
        void shouldReturnOkWhenParticipationExists() {
            when(participationRepository.findById(PARTICIPATION_ID)).thenReturn(Optional.of(participation));
            when(participationMapper.toDto(participation)).thenReturn(participationResponseDTO);

            ResponseEntity<ParticipationResponseDTO> result = participationService.getParticipationById(PARTICIPATION_ID);

            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();
            // assertThat(result.getBody()).isSameAs(participationResponseDTO);

            assertThat(result.getBody().getParticipationId()).isEqualTo(PARTICIPATION_ID);
            assertThat(result.getBody().getAccessToken()).isEqualTo(participationResponseDTO.getAccessToken());
            assertThat(result.getBody().getQuotationId()).isEqualTo(participationResponseDTO.getQuotationId());
            assertThat(result.getBody().getSupplierId()).isEqualTo(participationResponseDTO.getSupplierId());
            assertThat(result.getBody().getSupplierName()).isEqualTo(participationResponseDTO.getSupplierName());
            assertThat(result.getBody().getEmployerName()).isEqualTo(participationResponseDTO.getEmployerName());

            verify(participationRepository, times(1)).findById(PARTICIPATION_ID);
            verify(participationMapper, times(1)).toDto(participation);
            verifyNoInteractions(supplierRepository, quotationRepository);
            verifyNoMoreInteractions(participationRepository, participationMapper);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when participation doesn't exists")
        void shouldThrowResourceNotFoundExceptionWhenParticipationDoesntExists() {
            Long missingId = 999L;
            when(participationRepository.findById(missingId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> participationService.getParticipationById(missingId))
                    .isInstanceOf(ResourceNotFoundException.class)
                            .hasMessage("Participation with id " + missingId + " does not exists");

            verify(participationRepository, times(1)).findById(missingId);
            verifyNoInteractions(supplierRepository, quotationRepository, participationMapper);
            verifyNoMoreInteractions(participationRepository);
        }
    }

    @Nested
    class GetAllParticipations {

        @Test
        @DisplayName("should return 200 OK with a list of ParticipationResponseDTO when participations exist")
        void shouldReturnOkWithListWhenParticipationsExist() {
            Participation participation1 = participation;
            ParticipationResponseDTO participationResponseDTO1 = participationResponseDTO;

            LocalDateTime quotationStart = LocalDateTime.of(2026, 2, 1, 14, 0, 0);
            LocalDateTime quotationEnd = LocalDateTime.of(2026, 2, 2, 14, 0, 0);
            LocalDateTime createdAt = LocalDateTime.of(2026, 2, 1, 9, 10, 0);
            Quotation quotation2 = new Quotation(5L, quotationStart, quotationEnd, createdAt, company, null, null);
            Supplier supplier2 = new Supplier(6L, "Supplier B", "supplier2@email.com", "11977777777", "Employer SA", "09876543210987", createdAt, supplier.getCompany(), null);

            Participation participation2 = new Participation(4L, quotation2, supplier2, "accessToken2", null);
            ParticipationResponseDTO participationResponseDTO2 = new ParticipationResponseDTO(4L, "accessToken2", supplier2.getId(), quotation2.getId(), supplier2.getSupplierName(), supplier2.getEmployerName());

            when(participationRepository.findAll()).thenReturn(List.of(participation1, participation2));
            when(participationMapper.toDto(participation1)).thenReturn(participationResponseDTO1);
            when(participationMapper.toDto(participation2)).thenReturn(participationResponseDTO2);

            ResponseEntity<List<ParticipationResponseDTO>> result = participationService.getAllParticipations();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(2)
                    .containsExactly(participationResponseDTO1, participationResponseDTO2);

            verify(participationRepository, times(1)).findAll();
            verify(participationMapper, times(1)).toDto(participation1);
            verify(participationMapper, times(1)).toDto(participation2);
            verifyNoInteractions(supplierRepository, quotationRepository);
            verifyNoMoreInteractions(participationRepository, participationMapper);
        }

        @Test
        @DisplayName("should return 200 OK with an empty list when no participations exist")
        void shouldReturnOkWithEmptyListWhenNoSuppliersExist() {
            when(participationRepository.findAll()).thenReturn(List.of());

            ResponseEntity<List<ParticipationResponseDTO>> result = participationService.getAllParticipations();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(0)
                    .isEmpty();

            verify(participationRepository, times(1)).findAll();
            verifyNoInteractions(participationMapper, supplierRepository, quotationRepository);
            verifyNoMoreInteractions(participationRepository);
        }
    }

    @Nested
    class DeleteParticipationById {

        @Test
        @DisplayName("should return 200 OK with ParticipationResponseDTO and exclude participation when exists")
        void shouldReturnOkWhenDeleteParticipationSuccessfully() {
            when(participationRepository.findById(PARTICIPATION_ID)).thenReturn(Optional.of(participation));
            when(participationMapper.toDto(participation)).thenReturn(participationResponseDTO);

            ResponseEntity<ParticipationResponseDTO> result = participationService.deleteParticipationById(PARTICIPATION_ID);

            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isNotNull();
            // assertThat(result.getBody()).isSameAs(participationResponseDTO);

            assertThat(result.getBody().getParticipationId()).isEqualTo(PARTICIPATION_ID);
            assertThat(result.getBody().getAccessToken()).isEqualTo(participationResponseDTO.getAccessToken());
            assertThat(result.getBody().getQuotationId()).isEqualTo(participationResponseDTO.getQuotationId());
            assertThat(result.getBody().getSupplierId()).isEqualTo(participationResponseDTO.getSupplierId());
            assertThat(result.getBody().getSupplierName()).isEqualTo(participationResponseDTO.getSupplierName());
            assertThat(result.getBody().getEmployerName()).isEqualTo(participationResponseDTO.getEmployerName());

            verify(participationRepository, times(1)).findById(PARTICIPATION_ID);
            verify(participationRepository, times(1)).delete(participation);
            verify(participationMapper, times(1)).toDto(participation);
            verifyNoInteractions(supplierRepository, quotationRepository);
            verifyNoMoreInteractions(participationRepository, participationMapper);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException and not delete participation when it doesn't exists")
        void shouldThrowResourceNotFoundExceptionAndNotDeleteParticipationWhenItDoesntExists() {
            Long missingId = 999L;
            when(participationRepository.findById(missingId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> participationService.getParticipationById(missingId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Participation with id " + missingId + " does not exists");

            verify(participationRepository, times(1)).findById(missingId);
            verify(participationRepository, never()).delete(participation);
            verifyNoInteractions(supplierRepository, quotationRepository, participationMapper);
            verifyNoMoreInteractions(participationRepository);
        }
    }

    @Nested
    class DeleteAllParticipations {

        @Test
        @DisplayName("should return 200 OK with a list of ParticipationResponseDTO and delete participations when it exist")
        void shouldReturnOkWithListAndDeleteAllParticipationsWhenItExist() {
            Participation participation1 = participation;
            ParticipationResponseDTO participationResponseDTO1 = participationResponseDTO;

            LocalDateTime quotationStart = LocalDateTime.of(2026, 2, 1, 14, 0, 0);
            LocalDateTime quotationEnd = LocalDateTime.of(2026, 2, 2, 14, 0, 0);
            LocalDateTime createdAt = LocalDateTime.of(2026, 2, 1, 9, 10, 0);
            Quotation quotation2 = new Quotation(5L, quotationStart, quotationEnd, createdAt, company, null, null);
            Supplier supplier2 = new Supplier(6L, "Supplier B", "supplier2@email.com", "11977777777", "Employer SA", "09876543210987", createdAt, supplier.getCompany(), null);

            Participation participation2 = new Participation(4L, quotation2, supplier2, "accessToken2", null);
            ParticipationResponseDTO participationResponseDTO2 = new ParticipationResponseDTO(4L, "accessToken2", supplier2.getId(), quotation2.getId(), supplier2.getSupplierName(), supplier2.getEmployerName());

            when(participationRepository.findAll()).thenReturn(List.of(participation1, participation2));
            when(participationMapper.toDto(participation1)).thenReturn(participationResponseDTO1);
            when(participationMapper.toDto(participation2)).thenReturn(participationResponseDTO2);

            ResponseEntity<List<ParticipationResponseDTO>> result = participationService.deleteAllParticipations();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(2)
                    .containsExactly(participationResponseDTO1, participationResponseDTO2);

            verify(participationRepository, times(1)).findAll();
            verify(participationMapper, times(1)).toDto(participation1);
            verify(participationMapper, times(1)).toDto(participation2);
            verify(participationRepository, times(1)).deleteAll();
            verifyNoInteractions(supplierRepository, quotationRepository);
            verifyNoMoreInteractions(participationRepository, participationMapper);
        }

        @Test
        @DisplayName("should return 200 OK with an empty list and try to delete participation when it doesn't exist")
        void shouldReturnOkWithEmptyListAndTryToDeleteParticipationWhenItDoesntExist() {
            when(participationRepository.findAll()).thenReturn(List.of());

            ResponseEntity<List<ParticipationResponseDTO>> result = participationService.deleteAllParticipations();

            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody())
                    .isNotNull()
                    .hasSize(0)
                    .isEmpty();

            verify(participationRepository, times(1)).findAll();
            verify(participationRepository, never()).deleteAll();
            verifyNoInteractions(participationMapper, supplierRepository, quotationRepository);
            verifyNoMoreInteractions(participationRepository);
        }
    }
}

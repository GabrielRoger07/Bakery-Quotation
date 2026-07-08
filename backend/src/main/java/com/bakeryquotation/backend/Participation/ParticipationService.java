package com.bakeryquotation.backend.Participation;

import com.bakeryquotation.backend.Participation.DTO.ParticipationRequestDTO;
import com.bakeryquotation.backend.Participation.DTO.ParticipationResponseDTO;
import com.bakeryquotation.backend.Participation.DTO.SupplierParticipationResponseDTO;
import com.bakeryquotation.backend.Participation.mapper.ParticipationMapper;
import com.bakeryquotation.backend.Quotation.Quotation;
import com.bakeryquotation.backend.Quotation.QuotationRepository;
import com.bakeryquotation.backend.Supplier.Supplier;
import com.bakeryquotation.backend.Supplier.SupplierRepository;
import com.bakeryquotation.backend.exception.AccessDeniedException;
import com.bakeryquotation.backend.exception.DuplicateResourceException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ParticipationService {

    @Value("${app.pagination-size}")
    private int pageSize;

    private final ParticipationRepository participationRepository;
    private final ParticipationMapper participationMapper;
    private final SupplierRepository supplierRepository;
    private final QuotationRepository quotationRepository;

    public ParticipationService(ParticipationRepository participationRepository, ParticipationMapper participationMapper, SupplierRepository supplierRepository, QuotationRepository quotationRepository){
        this.participationRepository = participationRepository;
        this.participationMapper = participationMapper;
        this.supplierRepository = supplierRepository;
        this.quotationRepository = quotationRepository;
    }

    public ResponseEntity<ParticipationResponseDTO> getParticipationById(Long id){
        validateSupplierOwnership(id);
        Participation participation = participationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Participation with id " + id + " does not exists"));
        return ResponseEntity.status(HttpStatus.OK).body(participationMapper.toDto(participation));
    }

    public ResponseEntity<List<ParticipationResponseDTO>> getAllParticipations(){
        List<Participation> participations = participationRepository.findAll();
        List<ParticipationResponseDTO> participationResponseDTOS = new ArrayList<>();

        participations.forEach(participation -> {
            participationResponseDTOS.add(participationMapper.toDto(participation));
        });

        return ResponseEntity.status(HttpStatus.OK).body(participationResponseDTOS);
    }

    public ResponseEntity<List<ParticipationResponseDTO>> getAllParticipationsByQuotationId(Long quotationId){
        List<Participation> participations = participationRepository.findAllByQuotation_Id(quotationId);
        List<ParticipationResponseDTO> participationResponseDTOS = new ArrayList<>();

        participations.forEach(participation -> {
            participationResponseDTOS.add(participationMapper.toDto(participation));
        });

        return ResponseEntity.status(HttpStatus.OK).body(participationResponseDTOS);
    }

    public ResponseEntity<ParticipationResponseDTO> getParticipationByQuotationIdAndSupplierId(Long quotationId, Long supplierId){
        quotationRepository.findById(quotationId).orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + quotationId + " does not exists"));
        supplierRepository.findById(supplierId).orElseThrow(() -> new ResourceNotFoundException("Supplier with id " + supplierId + " does not exists"));

        Participation participation = participationRepository.findByQuotation_IdAndSupplier_Id(quotationId, supplierId).orElseThrow(() -> new ResourceNotFoundException("Participation with quotationId " + quotationId + " and supplierId " + supplierId + " does not exists"));

        validateSupplierOwnership(participation.getId());

        return ResponseEntity.status(HttpStatus.OK).body(participationMapper.toDto(participation));
    }

    public ResponseEntity<Page<SupplierParticipationResponseDTO>> getParticipationsBySupplierId(Pageable pageable, String field, String value){
        String supplierId = SecurityContextHolder.getContext().getAuthentication().getName();
        Pageable safePageable = PageRequest.of(pageable.getPageNumber(), pageSize, pageable.getSort());
        Page<Participation> participationsBySupplierId;

        boolean applyFilter = field != null && value != null && !value.isBlank();

        if(applyFilter){
            if(field.equals("status")){
                participationsBySupplierId = participationRepository.findBySupplierIdAndStatus(Long.parseLong(supplierId), value, Instant.now(), safePageable);
            } else {
                throw new ResourceNotFoundException("Invalid field");
            }
        } else {
            participationsBySupplierId = participationRepository.findBySupplier_Id(Long.parseLong(supplierId), safePageable);
        }

        Page<SupplierParticipationResponseDTO> participationsResponseDTOBySupplierId = participationsBySupplierId.map(participationMapper::toSupplierParticipationDto);
        return ResponseEntity.status(HttpStatus.OK).body(participationsResponseDTOBySupplierId);
    }

    public ResponseEntity<ParticipationResponseDTO> createParticipation(ParticipationRequestDTO participationRequestDTO){

        Long supplierId = participationRequestDTO.getSupplierId();
        Supplier supplier = supplierRepository.findById(supplierId).orElseThrow(() -> new ResourceNotFoundException("Supplier with id " + supplierId + " does not exists"));

        Long quotationId = participationRequestDTO.getQuotationId();
        Quotation quotation = quotationRepository.findById(quotationId).orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + quotationId + " does not exists"));

        Optional<Participation> exists = participationRepository.findByQuotation_IdAndSupplier_Id(quotationId, supplierId);
        if(exists.isPresent()){
            throw new DuplicateResourceException("Already exists a participation with quotationId " + quotationId + " and supplierId " + supplierId);
        }

        Participation participation = participationMapper.toEntity(participationRequestDTO);
        participation.setQuotation(quotation);
        participation.setSupplier(supplier);

        ParticipationResponseDTO participationSaved = participationMapper.toDto(participationRepository.save(participation));
        return ResponseEntity.status(HttpStatus.CREATED).body(participationSaved);
    }

    public ResponseEntity<List<ParticipationResponseDTO>> createParticipations(List<ParticipationRequestDTO> participationRequestDTOS){

        List<ParticipationResponseDTO> participationResponseDTOS = new ArrayList<>();

        participationRequestDTOS.forEach(participationRequestDTO -> {
            Long supplierId = participationRequestDTO.getSupplierId();
            Supplier supplier = supplierRepository.findById(supplierId).orElseThrow(() -> new ResourceNotFoundException("Supplier with id " + supplierId + " does not exists"));

            Long quotationId = participationRequestDTO.getQuotationId();
            Quotation quotation = quotationRepository.findById(quotationId).orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + quotationId + " does not exists"));

            Optional<Participation> exists = participationRepository.findByQuotation_IdAndSupplier_Id(quotationId, supplierId);
            if(exists.isPresent()){
                throw new DuplicateResourceException("Already exists a participation with quotationId " + quotationId + " and supplierId " + supplierId);
            }

            Participation participation = participationMapper.toEntity(participationRequestDTO);
            participation.setQuotation(quotation);
            participation.setSupplier(supplier);

            ParticipationResponseDTO participationSaved = participationMapper.toDto(participationRepository.save(participation));
            participationResponseDTOS.add(participationSaved);
        });

        return ResponseEntity.status(HttpStatus.CREATED).body(participationResponseDTOS);
    }

    public ResponseEntity<List<ParticipationResponseDTO>> updateParticipations(List<ParticipationRequestDTO> participationRequestDTOS){
        List<ParticipationResponseDTO> participationResponseDTOS = new ArrayList<>();
        List<Long> requestSuppliersIds = participationRequestDTOS.stream().map(ParticipationRequestDTO::getSupplierId).toList();

        List<Participation> participationsByQuotationId = participationRepository.findAllByQuotation_Id(participationRequestDTOS.getFirst().getQuotationId());
        List<Long> existedSuppliersIds = participationsByQuotationId.stream().map(p -> p.getSupplier().getId()).toList();

        List<Participation> participationsToRemove = participationsByQuotationId.stream().filter(participation -> !requestSuppliersIds.contains(participation.getSupplier().getId())).toList();
        List<ParticipationRequestDTO> newParticipations = participationRequestDTOS.stream().filter(participation -> !existedSuppliersIds.contains(participation.getSupplierId())).toList();

        participationRepository.deleteAll(participationsToRemove);

        newParticipations.forEach(participation -> {
            Long supplierId = participation.getSupplierId();
            Supplier supplier = supplierRepository.findById(supplierId).orElseThrow(() -> new ResourceNotFoundException("Supplier with id " + supplierId + " does not exists"));

            Long quotationId = participation.getQuotationId();
            Quotation quotation = quotationRepository.findById(quotationId).orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + quotationId + " does not exists"));

            Participation newParticipation = participationMapper.toEntity(participation);
            newParticipation.setQuotation(quotation);
            newParticipation.setSupplier(supplier);

            Participation participationSaved = participationRepository.save(newParticipation);
            participationResponseDTOS.add(participationMapper.toDto(participationSaved));
        });

        return ResponseEntity.status(HttpStatus.OK).body(participationResponseDTOS);
    }

    public ResponseEntity<ParticipationResponseDTO> deleteParticipationById(Long id){
        Participation participation = participationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Participation with id " + id + " does not exists"));
        participationRepository.delete(participation);
        return ResponseEntity.status(HttpStatus.OK).body(participationMapper.toDto(participation));
    }

    public ResponseEntity<List<ParticipationResponseDTO>> deleteAllParticipations(){
        List<Participation> participations = participationRepository.findAll();
        List<ParticipationResponseDTO> participationResponseDTOS = new ArrayList<>();

        if(!participations.isEmpty()) {
            participations.forEach(participation -> {
                participationResponseDTOS.add(participationMapper.toDto(participation));
            });
            participationRepository.deleteAll();
        }
        return ResponseEntity.status(HttpStatus.OK).body(participationResponseDTOS);
    }

    public void validateSupplierOwnership(Long participationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isSupplier = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_SUPPLIER"));

        if (!isSupplier) return;

        Participation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new ResourceNotFoundException("Participation with id " + participationId + " does not exist"));

        Long authenticatedSupplierId = Long.parseLong(authentication.getName());

        if (!participation.getSupplier().getId().equals(authenticatedSupplierId)) {
            throw new AccessDeniedException("You do not have permission to perform this action. Nice try");
        }
    }
}

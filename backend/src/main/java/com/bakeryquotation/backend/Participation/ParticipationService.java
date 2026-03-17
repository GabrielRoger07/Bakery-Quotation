package com.bakeryquotation.backend.Participation;

import com.bakeryquotation.backend.Participation.DTO.ParticipationRequestDTO;
import com.bakeryquotation.backend.Participation.DTO.ParticipationResponseDTO;
import com.bakeryquotation.backend.Participation.mapper.ParticipationMapper;
import com.bakeryquotation.backend.Quotation.Quotation;
import com.bakeryquotation.backend.Quotation.QuotationRepository;
import com.bakeryquotation.backend.Supplier.Supplier;
import com.bakeryquotation.backend.Supplier.SupplierRepository;
import com.bakeryquotation.backend.exception.DuplicateResourceException;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ParticipationService {

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

        return ResponseEntity.status(HttpStatus.OK).body(participationMapper.toDto(participation));
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
}

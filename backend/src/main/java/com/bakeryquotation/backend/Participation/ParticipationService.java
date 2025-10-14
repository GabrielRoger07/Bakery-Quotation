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

        String link = randomString(255);

        participation.setLink(link);
        participation.setAccessToken("Access Token de teste");

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

            String link = randomString(255);
            participation.setLink(link);
            participation.setAccessToken("Access Token de teste");

            ParticipationResponseDTO participationSaved = participationMapper.toDto(participationRepository.save(participation));
            participationResponseDTOS.add(participationSaved);
        });

        return ResponseEntity.status(HttpStatus.CREATED).body(participationResponseDTOS);
    }

    public ResponseEntity<ParticipationResponseDTO> deleteParticipationById(Long id){
        Participation participation = participationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Participation with id " + id + " does not exists"));
        participationRepository.delete(participation);
        return ResponseEntity.status(HttpStatus.OK).body(participationMapper.toDto(participation));
    }

    public ResponseEntity<List<ParticipationResponseDTO>> deleteAllParticipations(){
        List<Participation> participations = participationRepository.findAll();
        List<ParticipationResponseDTO> participationResponseDTOS = new ArrayList<>();

        participations.forEach(participation -> {
            participationResponseDTOS.add(participationMapper.toDto(participation));
        });

        participationRepository.deleteAll();
        return ResponseEntity.status(HttpStatus.OK).body(participationResponseDTOS);
    }

    public static String randomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = (int) (java.lang.Math.random() * chars.length());
            sb.append(chars.charAt(index));
        }
        return sb.toString();
    }
}

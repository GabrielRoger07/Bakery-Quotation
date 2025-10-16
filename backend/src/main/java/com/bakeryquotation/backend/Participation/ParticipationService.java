package com.bakeryquotation.backend.Participation;

import com.bakeryquotation.backend.Participation.DTO.AccessTokenRequestDTO;
import com.bakeryquotation.backend.Participation.DTO.ParticipationRequestDTO;
import com.bakeryquotation.backend.Participation.DTO.ParticipationResponseDTO;
import com.bakeryquotation.backend.Participation.mapper.ParticipationMapper;
import com.bakeryquotation.backend.Quotation.Quotation;
import com.bakeryquotation.backend.Quotation.QuotationRepository;
import com.bakeryquotation.backend.Supplier.Supplier;
import com.bakeryquotation.backend.Supplier.SupplierRepository;
import com.bakeryquotation.backend.exception.DuplicateResourceException;
import com.bakeryquotation.backend.exception.InvalidAccessTokenException;
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

        String accessToken = generateDigitToken(8);
        participation.setAccessToken(accessToken);
        participation.setLink("Link de teste");

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

            String link = generateDigitToken(8);
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

    public ResponseEntity<ParticipationResponseDTO> validateAccessToken(Long participationId, AccessTokenRequestDTO accessToken){
        Participation participation = participationRepository.findById(participationId).orElseThrow(() -> new ResourceNotFoundException("Participation with id " + participationId + " does not exists"));

        if(!accessToken.getAccessToken().equals(participation.getAccessToken())){
            throw new InvalidAccessTokenException("Invalid token");
        }
        return ResponseEntity.status(HttpStatus.OK).body(participationMapper.toDto(participation));
    }

    public static String generateDigitToken(Integer digits) {
        SecureRandom random = new SecureRandom();
        int pot1 = (int) Math.pow(10, (digits - 1));
        int pot2 = (int) Math.pow(90, (digits - 1));
        int num = pot1 + random.nextInt(pot2); // entre 10000000 e 99999999
        return String.valueOf(num);
    }
}

package com.bakeryquotation.backend.QuotationSnapshot;

import com.bakeryquotation.backend.QuotationSnapshot.DTO.QuotationSnapshotResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quotation-snapshots")
public class QuotationSnapshotController {

    private final QuotationSnapshotService snapshotService;

    public QuotationSnapshotController(QuotationSnapshotService snapshotService) {
        this.snapshotService = snapshotService;
    }

    @GetMapping("/{quotationId}")
    public ResponseEntity<List<QuotationSnapshotResponseDTO>> getByQuotationId(
            @PathVariable Long quotationId) {
        return snapshotService.getSnapshotByQuotationId(quotationId);
    }

    @GetMapping("/{quotationId}/participations/{participationId}")
    public ResponseEntity<List<QuotationSnapshotResponseDTO>> getByQuotationIdAndParticipationId(
            @PathVariable Long quotationId,
            @PathVariable Long participationId) {
        return snapshotService.getSnapshotByQuotationIdAndParticipationId(quotationId, participationId);
    }
}

package com.bakeryquotation.backend.Participation;

import com.bakeryquotation.backend.Bid.Bid;
import com.bakeryquotation.backend.Bid.BidRepository;
import com.bakeryquotation.backend.Contain.Contain;
import com.bakeryquotation.backend.Contain.ContainRepository;
import com.bakeryquotation.backend.exception.ResourceNotFoundException;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;

@Service
public class SupplierReportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("America/Sao_Paulo"));
    private static final Locale PT_BR = new Locale("pt", "BR");

    private final ParticipationRepository participationRepository;
    private final ParticipationService participationService;
    private final BidRepository bidRepository;
    private final ContainRepository containRepository;

    public SupplierReportService(ParticipationRepository participationRepository,
                                  ParticipationService participationService,
                                  BidRepository bidRepository,
                                  ContainRepository containRepository) {
        this.participationRepository = participationRepository;
        this.participationService = participationService;
        this.bidRepository = bidRepository;
        this.containRepository = containRepository;
    }

    @Transactional(readOnly = true)
    public byte[] generateReport(Long participationId) {
        participationService.validateSupplierOwnership(participationId);

        Participation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new ResourceNotFoundException("Participation with id " + participationId + " does not exists"));

        Long quotationId = participation.getQuotation().getId();
        String supplierName = participation.getSupplier().getSupplierName();

        List<Bid> allBids = bidRepository.findAllByParticipation_Quotation_Id(quotationId);
        Map<Long, Bid> lowestBidsMap = buildLowestBidsMap(allBids);

        List<Contain> contains = containRepository.findAllByQuotation_Id(quotationId);
        Map<Long, Contain> containsByProductId = new HashMap<>();
        for (Contain c : contains) {
            containsByProductId.put(c.getProduct().getId(), c);
        }

        List<Bid> wonBids = lowestBidsMap.values().stream()
                .filter(b -> b.getParticipation().getId().equals(participationId))
                .sorted(Comparator.comparing(b -> b.getProduct().getProductName()))
                .toList();

        BigDecimal total = wonBids.stream()
                .map(Bid::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 54, 36);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            addTitle(doc, supplierName);
            addInfoGrid(doc, participation, wonBids.size(), total);
            addWonBidsTable(doc, wonBids, containsByProductId);

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate supplier PDF report", e);
        }
    }

    private Map<Long, Bid> buildLowestBidsMap(List<Bid> bids) {
        Map<Long, Bid> lowestBids = new HashMap<>();
        for (Bid bid : bids) {
            Long productId = bid.getProduct().getId();
            BigDecimal pricePerUnit = bid.getPrice().divide(bid.getQuantity().add(bid.getBonus()), MathContext.DECIMAL128);
            if (!lowestBids.containsKey(productId)) {
                lowestBids.put(productId, bid);
            } else {
                Bid current = lowestBids.get(productId);
                BigDecimal currentPricePerUnit = current.getPrice().divide(
                        current.getQuantity().add(current.getBonus()), MathContext.DECIMAL128);
                if (pricePerUnit.compareTo(currentPricePerUnit) < 0) {
                    lowestBids.put(productId, bid);
                }
            }
        }
        return lowestBids;
    }

    private void addTitle(Document doc, String supplierName) throws DocumentException {
        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(17, 24, 39));
        Paragraph title = new Paragraph("Lances Vencidos — " + supplierName, titleFont);
        title.setSpacingAfter(16);
        doc.add(title);
    }

    private void addInfoGrid(Document doc, Participation participation, int totalWon, BigDecimal total)
            throws DocumentException {
        Font labelFont = new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(107, 114, 128));
        Font valueFont = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(17, 24, 39));
        Font valueAccentFont = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(37, 99, 235));

        PdfPTable grid = new PdfPTable(4);
        grid.setWidthPercentage(100);
        grid.setSpacingAfter(20);

        addInfoCard(grid, "Início", DATE_FORMATTER.format(participation.getQuotation().getQuotationStart()), labelFont, valueFont, false);
        addInfoCard(grid, "Fim", DATE_FORMATTER.format(participation.getQuotation().getQuotationEnd()), labelFont, valueFont, false);
        addInfoCard(grid, "Itens Vencidos", String.valueOf(totalWon), labelFont, valueFont, false);
        addInfoCard(grid, "Total Vencido", formatMoney(total), labelFont, valueAccentFont, true);

        doc.add(grid);
    }

    private void addInfoCard(PdfPTable table, String label, String value,
                              Font labelFont, Font valueFont, boolean highlight) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(10);
        cell.setBorderColor(new Color(221, 221, 221));
        cell.setBorderWidth(0.5f);
        if (highlight) {
            cell.setBackgroundColor(new Color(239, 246, 255));
        }
        Paragraph labelP = new Paragraph(label, labelFont);
        labelP.setSpacingAfter(4);
        cell.addElement(labelP);
        cell.addElement(new Paragraph(value, valueFont));
        table.addCell(cell);
    }

    private void addWonBidsTable(Document doc, List<Bid> wonBids, Map<Long, Contain> containsByProductId)
            throws DocumentException {
        Font sectionFont = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(17, 24, 39));
        Font headerFont = new Font(Font.HELVETICA, 9, Font.BOLD, new Color(85, 85, 85));
        Font cellFont = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(17, 24, 39));

        Paragraph sectionTitle = new Paragraph("Itens Vencidos", sectionFont);
        sectionTitle.setSpacingAfter(8);
        doc.add(sectionTitle);

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3f, 2f, 1.5f, 2f, 2f});

        String[] headers = {"Produto", "Marca", "Qtd", "Preço Unitário", "Total"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
            cell.setBackgroundColor(new Color(243, 244, 246));
            cell.setPadding(8);
            cell.setBorderColor(new Color(200, 200, 200));
            cell.setBorderWidth(0.5f);
            table.addCell(cell);
        }

        for (int i = 0; i < wonBids.size(); i++) {
            Bid bid = wonBids.get(i);
            Contain contain = containsByProductId.get(bid.getProduct().getId());
            Color rowBg = (i % 2 == 0) ? Color.WHITE : new Color(249, 250, 251);

            BigDecimal totalQty = bid.getQuantity().add(bid.getBonus());
            String pricePerUnit = formatMoney(bid.getPrice().divide(totalQty, 2, RoundingMode.HALF_UP));
            String brand = (contain != null && contain.getBrand() != null) ? contain.getBrand() : "-";
            String qty = bid.getQuantity().stripTrailingZeros().toPlainString() + " " + contain.getUnitOfMeasure();

            addTableRow(table, cellFont, rowBg,
                    bid.getProduct().getProductName(),
                    brand,
                    qty,
                    pricePerUnit,
                    formatMoney(bid.getPrice())
            );
        }

        doc.add(table);
    }

    private void addTableRow(PdfPTable table, Font font, Color background, String... values) {
        for (String value : values) {
            PdfPCell cell = new PdfPCell(new Phrase(value, font));
            cell.setPadding(7);
            cell.setBorderColor(new Color(238, 238, 238));
            cell.setBorderWidth(0.5f);
            cell.setBackgroundColor(background);
            table.addCell(cell);
        }
    }

    private String formatMoney(BigDecimal value) {
        NumberFormat nf = NumberFormat.getInstance(PT_BR);
        nf.setMinimumFractionDigits(2);
        nf.setMaximumFractionDigits(2);
        return "R$ " + nf.format(value);
    }
}

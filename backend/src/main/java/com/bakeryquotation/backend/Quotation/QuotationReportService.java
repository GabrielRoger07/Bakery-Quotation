package com.bakeryquotation.backend.Quotation;

import com.bakeryquotation.backend.Bid.Bid;
import com.bakeryquotation.backend.Bid.BidRepository;
import com.bakeryquotation.backend.Contain.Contain;
import com.bakeryquotation.backend.Contain.ContainRepository;
import com.bakeryquotation.backend.Participation.ParticipationRepository;
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
public class QuotationReportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("America/Sao_Paulo"));
    private static final Locale PT_BR = new Locale("pt", "BR");

    private final QuotationRepository quotationRepository;
    private final ContainRepository containRepository;
    private final BidRepository bidRepository;
    private final ParticipationRepository participationRepository;

    public QuotationReportService(QuotationRepository quotationRepository,
                                   ContainRepository containRepository,
                                   BidRepository bidRepository,
                                   ParticipationRepository participationRepository) {
        this.quotationRepository = quotationRepository;
        this.containRepository = containRepository;
        this.bidRepository = bidRepository;
        this.participationRepository = participationRepository;
    }

    @Transactional(readOnly = true)
    public byte[] generateReport(Long quotationId) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation with id " + quotationId + " does not exists"));

        List<Contain> contains = containRepository.findAllByQuotation_Id(quotationId);
        List<Bid> bids = bidRepository.findAllByParticipation_Quotation_Id(quotationId);
        int totalSuppliers = participationRepository.findAllByQuotation_Id(quotationId).size();

        Map<Long, Bid> lowestBids = buildLowestBidsMap(bids);

        BigDecimal total = lowestBids.values().stream()
                .map(Bid::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        contains.sort(Comparator.comparing(c -> c.getProduct().getProductName()));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 54, 36);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            addTitle(doc, quotation.getId());
            addInfoGrid(doc, quotation, bids.size(), totalSuppliers, contains.size(), total);
            addProductsTable(doc, contains, lowestBids);

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
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

    private void addTitle(Document doc, Long quotationId) throws DocumentException {
        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(17, 24, 39));
        Paragraph title = new Paragraph("Relatório de Cotação #" + quotationId, titleFont);
        title.setSpacingAfter(16);
        doc.add(title);
    }

    private void addInfoGrid(Document doc, Quotation quotation, int totalBids,
                              int totalSuppliers, int totalProducts, BigDecimal total) throws DocumentException {
        Font labelFont = new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(107, 114, 128));
        Font valueFont = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(17, 24, 39));
        Font valueAccentFont = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(37, 99, 235));

        PdfPTable grid = new PdfPTable(3);
        grid.setWidthPercentage(100);
        grid.setSpacingAfter(20);

        addInfoCard(grid, "Início", DATE_FORMATTER.format(quotation.getQuotationStart()), labelFont, valueFont, false);
        addInfoCard(grid, "Fim", DATE_FORMATTER.format(quotation.getQuotationEnd()), labelFont, valueFont, false);
        addInfoCard(grid, "Total", formatMoney(total), labelFont, valueAccentFont, true);
        addInfoCard(grid, "Total de Lances", String.valueOf(totalBids), labelFont, valueFont, false);
        addInfoCard(grid, "Fornecedores", String.valueOf(totalSuppliers), labelFont, valueFont, false);
        addInfoCard(grid, "Produtos", String.valueOf(totalProducts), labelFont, valueFont, false);

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

    private void addProductsTable(Document doc, List<Contain> contains, Map<Long, Bid> lowestBids)
            throws DocumentException {
        Font sectionFont = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(17, 24, 39));
        Font headerFont = new Font(Font.HELVETICA, 9, Font.BOLD, new Color(85, 85, 85));
        Font cellFont = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(17, 24, 39));

        Paragraph sectionTitle = new Paragraph("Lista de Produtos", sectionFont);
        sectionTitle.setSpacingAfter(8);
        doc.add(sectionTitle);

        PdfPTable table = new PdfPTable(8);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3f, 2f, 1.5f, 2f, 2f, 2.5f, 2.5f, 2.5f});

        String[] headers = {"Produto", "Marca", "Qtd", "Menor Lance", "Preço Unitário", "Fornecedor", "Cnpj Empresa", "Nome Empresa"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
            cell.setBackgroundColor(new Color(243, 244, 246));
            cell.setPadding(8);
            cell.setBorderColor(new Color(200, 200, 200));
            cell.setBorderWidth(0.5f);
            table.addCell(cell);
        }

        for (int i = 0; i < contains.size(); i++) {
            Contain contain = contains.get(i);
            Long productId = contain.getProduct().getId();
            Bid lowestBid = lowestBids.get(productId);
            Color rowBg = (i % 2 == 0) ? Color.WHITE : new Color(249, 250, 251);

            String lowestBidStr = "-";
            String pricePerUnitStr = "-";
            String supplierName = "-";
            String employerCnpj = "-";
            String employerName = "-";

            if (lowestBid != null) {
                lowestBidStr = formatMoney(lowestBid.getPrice());
                BigDecimal totalQty = lowestBid.getQuantity().add(lowestBid.getBonus());
                pricePerUnitStr = formatMoney(lowestBid.getPrice().divide(totalQty, 2, RoundingMode.HALF_UP));
                supplierName = lowestBid.getParticipation().getSupplier().getSupplierName();
                employerCnpj = formatCnpj(lowestBid.getParticipation().getSupplier().getEmployerCnpj());
                employerName = lowestBid.getParticipation().getSupplier().getEmployerName();
            }

            addTableRow(table, cellFont, rowBg,
                    contain.getProduct().getProductName(),
                    contain.getBrand() != null ? contain.getBrand() : "-",
                    contain.getQuantity().stripTrailingZeros().toPlainString() + " " + contain.getUnitOfMeasure(),
                    lowestBidStr,
                    lowestBid != null ? pricePerUnitStr + "/" + contain.getUnitOfMeasure() : pricePerUnitStr,
                    supplierName,
                    employerCnpj,
                    employerName
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

    private String formatCnpj(String cnpj) {
        if(cnpj.length() != 14) return cnpj;

        return  cnpj.substring(0, 2) + "." +
                cnpj.substring(2, 5) + "." +
                cnpj.substring(5, 8) + "/" +
                cnpj.substring(8, 12) + "-" +
                cnpj.substring(12, 14);
    }
}

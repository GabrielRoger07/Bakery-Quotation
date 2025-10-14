package com.bakeryquotation.backend.Participation;

import com.bakeryquotation.backend.Quotation.Quotation;
import com.bakeryquotation.backend.Supplier.Supplier;
import jakarta.persistence.*;

@Entity
@Table( name = "participation",
        uniqueConstraints = {
            @UniqueConstraint(name = "PARTICIPATION_link_UK", columnNames = "link"),
            @UniqueConstraint(name = "PARTICIPATION_supplierId_quotationId_UK", columnNames = {"supplierId", "quotationId"})
        }
)
public class Participation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "participationId")
    private Long id;

    @ManyToOne(optional = false, targetEntity = Quotation.class)
    @JoinColumn(name = "quotationId",
                referencedColumnName = "quotationId",
                foreignKey = @ForeignKey(
                        name = "PARTICIPATION_QUOTATION_FK"
                ),
                nullable = false
    )
    private Quotation quotation;

    @ManyToOne(optional = false, targetEntity = Supplier.class)
    @JoinColumn(name = "supplierId",
                referencedColumnName = "supplierId",
                foreignKey = @ForeignKey(
                        name = "PARTICIPATION_SUPPLIER_FK"
                ),
                nullable = false
    )
    private Supplier supplier;

    @Column(name = "link", nullable = false)
    private String link;

    @Column(name = "accessToken", nullable = false)
    private String accessToken;

    public Participation() {
    }

    public Participation(Quotation quotation, Supplier supplier, String link, String accessToken) {
        this.quotation = quotation;
        this.supplier = supplier;
        this.link = link;
        this.accessToken = accessToken;
    }

    public Participation(Long id, Quotation quotation, Supplier supplier, String link, String accessToken) {
        this.id = id;
        this.quotation = quotation;
        this.supplier = supplier;
        this.link = link;
        this.accessToken = accessToken;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Quotation getQuotation() {
        return quotation;
    }

    public void setQuotation(Quotation quotation) {
        this.quotation = quotation;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
}

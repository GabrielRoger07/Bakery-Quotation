package com.bakeryquotation.backend.Contain;

import com.bakeryquotation.backend.Product.Product;
import com.bakeryquotation.backend.Quotation.Quotation;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "contain")
public class Contain {

    @EmbeddedId
    private ContainId containId;

    @ManyToOne()
    @JoinColumn(name = "quotationId", referencedColumnName = "quotationId", foreignKey = @ForeignKey(name = "contain_QUOTATION_FK"))
    @MapsId("quotationId")
    private Quotation quotation;

    @ManyToOne()
    @JoinColumn(name = "productId", referencedColumnName = "productId", foreignKey = @ForeignKey(name = "contain_PRODUCT_FK"))
    @MapsId("productId")
    private Product product;

    @Column(name = "quantity", nullable = false, precision = 6, scale = 2)
    private BigDecimal quantity;

    @Column(name = "bonusLimit", nullable = false, precision = 6, scale = 2)
    private BigDecimal bonusLimit;

    public Contain() {
    }

    public Contain(ContainId containId, Quotation quotation, Product product, BigDecimal quantity, BigDecimal bonusLimit) {
        this.containId = containId;
        this.quotation = quotation;
        this.product = product;
        this.quantity = quantity;
        this.bonusLimit = bonusLimit;
    }

    public ContainId getContainId() {
        return containId;
    }

    public void setContainId(ContainId containId) {
        this.containId = containId;
    }

    public Quotation getQuotation() {
        return quotation;
    }

    public void setQuotation(Quotation quotation) {
        this.quotation = quotation;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getBonusLimit() {
        return bonusLimit;
    }

    public void setBonusLimit(BigDecimal bonusLimit) {
        this.bonusLimit = bonusLimit;
    }
}

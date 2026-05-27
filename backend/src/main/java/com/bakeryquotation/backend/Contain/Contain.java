package com.bakeryquotation.backend.Contain;

import com.bakeryquotation.backend.Product.Product;
import com.bakeryquotation.backend.Quotation.Quotation;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Entity
@Table(name = "contain")
public class Contain {

    @EmbeddedId
    private ContainId containId;

    @ManyToOne()
    @JoinColumn(name = "quotationId", referencedColumnName = "quotationId", foreignKey = @ForeignKey(name = "contain_quotation_fk"))
    @MapsId("quotationId")
    private Quotation quotation;

    @ManyToOne()
    @JoinColumn(name = "productId", referencedColumnName = "productId", foreignKey = @ForeignKey(name = "contain_product_fk"))
    @MapsId("productId")
    private Product product;

    @Column(name = "quantity", nullable = false, precision = 6, scale = 2)
    private BigDecimal quantity;

    @Column(name = "bonusLimit", nullable = false, precision = 6, scale = 2)
    private BigDecimal bonusLimit;

    @Column(name = "brand", length = 40)
    private String brand;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "unitOfMeasure", nullable = false)
    private UnitOfMeasure unitOfMeasure;

    public Contain() {
    }

    public Contain(Quotation quotation, Product product, BigDecimal quantity, BigDecimal bonusLimit, String brand, UnitOfMeasure unitOfMeasure) {
        this.quotation = quotation;
        this.product = product;
        this.quantity = quantity;
        this.bonusLimit = bonusLimit;
        this.brand = brand;
        this.unitOfMeasure = unitOfMeasure;

        this.containId = new ContainId();
        this.containId.setProductId(product.getId());
        this.containId.setQuotationId(quotation.getId());
    }

    public Contain(ContainId containId, Quotation quotation, Product product, BigDecimal quantity, BigDecimal bonusLimit, String brand, UnitOfMeasure unitOfMeasure) {
        this.containId = containId;
        this.quotation = quotation;
        this.product = product;
        this.quantity = quantity;
        this.bonusLimit = bonusLimit;
        this.brand = brand;
        this.unitOfMeasure = unitOfMeasure;
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

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public UnitOfMeasure getUnitOfMeasure() {
        return unitOfMeasure;
    }

    public void setUnitOfMeasure(UnitOfMeasure unitOfMeasure) {
        this.unitOfMeasure = unitOfMeasure;
    }
}

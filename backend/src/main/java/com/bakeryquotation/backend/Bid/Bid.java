package com.bakeryquotation.backend.Bid;

import com.bakeryquotation.backend.Participation.Participation;
import com.bakeryquotation.backend.Product.Product;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bid")
public class Bid {

    @EmbeddedId
    private BidId bidId;

    @ManyToOne()
    @JoinColumn(name = "participationId", referencedColumnName = "id", foreignKey = @ForeignKey(name = "bid_PARTICIPATION_FK"))
    @MapsId("participationId")
    private Participation participation;

    @ManyToOne()
    @JoinColumn(name = "productId", referencedColumnName = "id", foreignKey = @ForeignKey(name = "bid_PRODUCT_FK"))
    @MapsId("quotationId")
    private Product product;

    @Column(name = "price", nullable = false, precision = 6, scale = 2)
    private BigDecimal price;

    @Column(name = "quantity", nullable = false, precision = 6, scale = 2)
    private BigDecimal quantity;

    @Column(name = "bonus", nullable = false, precision = 6, scale = 2)
    private BigDecimal bonus;

    @Column(name = "createdAt", nullable = false, updatable = false, columnDefinition = "DATETIME")
    private LocalDateTime createdAt;

    public Bid() {
    }

    public Bid(BidId bidId, Participation participation, Product product, BigDecimal price, BigDecimal quantity, BigDecimal bonus) {
        this.bidId = bidId;
        this.participation = participation;
        this.product = product;
        this.price = price;
        this.quantity = quantity;
        this.bonus = bonus;
    }

    public Bid(BidId bidId, Participation participation, Product product, BigDecimal price, BigDecimal quantity, BigDecimal bonus, LocalDateTime createdAt) {
        this.bidId = bidId;
        this.participation = participation;
        this.product = product;
        this.price = price;
        this.quantity = quantity;
        this.bonus = bonus;
        this.createdAt = createdAt;
    }

    public BidId getBidId() {
        return bidId;
    }

    public void setBidId(BidId bidId) {
        this.bidId = bidId;
    }

    public Participation getParticipation() {
        return participation;
    }

    public void setParticipation(Participation participation) {
        this.participation = participation;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getBonus() {
        return bonus;
    }

    public void setBonus(BigDecimal bonus) {
        this.bonus = bonus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

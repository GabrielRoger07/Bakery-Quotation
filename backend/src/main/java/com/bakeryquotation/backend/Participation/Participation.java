package com.bakeryquotation.backend.Participation;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Product.Product;
import com.bakeryquotation.backend.Quotation.Quotation;
import com.bakeryquotation.backend.Supplier.Supplier;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "participation")
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

    @ManyToMany
    @JoinTable(
            name = "bid",
            joinColumns = @JoinColumn(name = "participationId"),
            inverseJoinColumns = @JoinColumn(name = "productId")
    )
    private Set<Product> products = new HashSet<>();

    public Participation() {
    }

    public Participation(Quotation quotation, Supplier supplier) {
        this.quotation = quotation;
        this.supplier = supplier;
    }


}

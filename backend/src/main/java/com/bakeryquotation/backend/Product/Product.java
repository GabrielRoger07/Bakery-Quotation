package com.bakeryquotation.backend.Product;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id", columnDefinition = "BIGINT")
    private Long id;

    @NotNull
    @NotEmpty
    @Column(name = "product_name", nullable = false, columnDefinition = "VARCHAR(40)")
    private String productName;

    @Enumerated(EnumType.STRING)
    @Column(name = "unit_of_measure")
    private UnitOfMeasure unitOfMeasure;
}

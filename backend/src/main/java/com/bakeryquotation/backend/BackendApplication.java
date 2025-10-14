package com.bakeryquotation.backend;

import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Contain.Contain;
import com.bakeryquotation.backend.Contain.ContainRepository;
import com.bakeryquotation.backend.Participation.Participation;
import com.bakeryquotation.backend.Participation.ParticipationRepository;
import com.bakeryquotation.backend.Product.Product;
import com.bakeryquotation.backend.Product.ProductRepository;
import com.bakeryquotation.backend.Product.UnitOfMeasure;
import com.bakeryquotation.backend.Quotation.Quotation;
import com.bakeryquotation.backend.Quotation.QuotationRepository;
import com.bakeryquotation.backend.Supplier.Supplier;
import com.bakeryquotation.backend.Supplier.SupplierRepository;
import com.github.javafaker.Faker;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.parameters.P;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Random;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner run(CompanyRepository companyRepository,
                                 SupplierRepository supplierRepository,
                                 ProductRepository productRepository,
                                 QuotationRepository quotationRepository,
                                 ContainRepository containRepository,
                                 ParticipationRepository participationRepository,
                                 PasswordEncoder passwordEncoder){
        return args -> {
            Faker faker = new Faker(new Locale("pt-BR"));
            Random rnd = new Random();

            String password1 = passwordEncoder.encode("123");
            String password2 = passwordEncoder.encode("456");

            Company company1 = new Company("12345678000195", "Teste Comércio S.A.", "61999999999", "testecomercio@gmail.com", password1);
            Company company2 = new Company("61703542949549", "Teste Soluções LTDA", "61988888888", "testesolucoes@gmail.com", password2);

            companyRepository.save(company1);
            companyRepository.save(company2);

            Quotation quotation1 = new Quotation(LocalDateTime.parse("2025-12-12T08:00:00"), LocalDateTime.parse("2025-12-12T10:00:00"), company1);
            Quotation quotation2 = new Quotation(LocalDateTime.parse("2025-12-15T16:00:00"), LocalDateTime.parse("2025-12-15T18:00:00"), company1);
            Quotation quotation3 = new Quotation(LocalDateTime.parse("2025-11-11T08:00:00"), LocalDateTime.parse("2025-11-11T10:00:00"), company2);

            quotationRepository.save(quotation1);
            quotationRepository.save(quotation2);
            quotationRepository.save(quotation3);

            for(int i = 0; i < 10; i++){

                UnitOfMeasure unit = UnitOfMeasure.values()[rnd.nextInt(UnitOfMeasure.values().length)];

                if(i < 5){
                    Supplier supplier = new Supplier(faker.name().firstName(), "contact" + i + "@gmail.com", "6199999999" + i, faker.company().name(), generateValidCnpj(rnd), company1);
                    Product product = new Product(faker.commerce().productName(), unit, company1);
                    supplierRepository.save(supplier);
                    productRepository.save(product);
                }else{
                    Supplier supplier = new Supplier(faker.name().firstName(), "contact" + i + "@gmail.com", "6199999999" + i, faker.company().name(), generateValidCnpj(rnd), company2);
                    Product product = new Product(faker.commerce().productName(), unit, company2);
                    supplierRepository.save(supplier);
                    productRepository.save(product);
                }
            }

            List<Product> products = productRepository.findAll();
            Contain contain1 = new Contain(quotation1, products.get(0), BigDecimal.valueOf(10.0), BigDecimal.valueOf(0.0));
            Contain contain2 = new Contain(quotation1, products.get(1), BigDecimal.valueOf(5.0), BigDecimal.valueOf(3.0));
            Contain contain3 = new Contain(quotation2, products.get(2), BigDecimal.valueOf(2.0), BigDecimal.valueOf(0.0));

            containRepository.save(contain1);
            containRepository.save(contain2);
            containRepository.save(contain3);

            List<Supplier> suppliers = supplierRepository.findAll();
            Participation participation1 = new Participation(quotation1, suppliers.get(0), "Link de Acesso 1", "accessToken");
            Participation participation2 = new Participation(quotation1, suppliers.get(1), "Link de Acesso 2", "accessToken");
            Participation participation3 = new Participation(quotation2, suppliers.get(2), "Link de Acesso 3", "accessToken");

            participationRepository.save(participation1);
            participationRepository.save(participation2);
            participationRepository.save(participation3);
        };
    }

    private static String generateValidCnpj(Random rnd) {
        int[] base = new int[12];
        for (int i = 0; i < 12; i++) {
            base[i] = rnd.nextInt(10);
        }

        int[] weights1 = {5,4,3,2,9,8,7,6,5,4,3,2};
        int sum1 = 0;
        for (int i = 0; i < 12; i++) {
            sum1 += base[i] * weights1[i];
        }
        int mod1 = sum1 % 11;
        int digit1 = (mod1 < 2) ? 0 : 11 - mod1;

        // prepare array de 13 dígitos (12 base + primeiro dígito verificador)
        int[] basePlus1 = new int[13];
        System.arraycopy(base, 0, basePlus1, 0, 12);
        basePlus1[12] = digit1;

        int[] weights2 = {6,5,4,3,2,9,8,7,6,5,4,3,2};
        int sum2 = 0;
        for (int i = 0; i < 13; i++) {
            sum2 += basePlus1[i] * weights2[i];
        }
        int mod2 = sum2 % 11;
        int digit2 = (mod2 < 2) ? 0 : 11 - mod2;

        // concatena tudo em string de 14 dígitos
        StringBuilder sb = new StringBuilder(14);
        for (int d : base) sb.append(d);
        sb.append(digit1).append(digit2);
        return sb.toString();
    }
}

package com.bakeryquotation.backend.config;

import com.bakeryquotation.backend.Bid.Bid;
import com.bakeryquotation.backend.Bid.BidRepository;
import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Company.CompanyRepository;
import com.bakeryquotation.backend.Contain.Contain;
import com.bakeryquotation.backend.Contain.ContainRepository;
import com.bakeryquotation.backend.Contain.UnitOfMeasure;
import com.bakeryquotation.backend.Department.Department;
import com.bakeryquotation.backend.Department.DepartmentRepository;
import com.bakeryquotation.backend.Participation.Participation;
import com.bakeryquotation.backend.Participation.ParticipationRepository;
import com.bakeryquotation.backend.Product.Product;
import com.bakeryquotation.backend.Product.ProductRepository;
import com.bakeryquotation.backend.Quotation.Quotation;
import com.bakeryquotation.backend.Quotation.QuotationRepository;
import com.bakeryquotation.backend.Supplier.Supplier;
import com.bakeryquotation.backend.Supplier.SupplierRepository;
import com.github.javafaker.Faker;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Random;

@Configuration
@Profile("dev")
public class DevDataSeeder {

    @Bean
    public CommandLineRunner seed(CompanyRepository companyRepository,
                                 SupplierRepository supplierRepository,
                                 ProductRepository productRepository,
                                 QuotationRepository quotationRepository,
                                 ContainRepository containRepository,
                                 ParticipationRepository participationRepository,
                                 BidRepository bidRepository,
                                 DepartmentRepository departmentRepository,
                                 PasswordEncoder passwordEncoder){
        return args -> {
            Faker faker = new Faker(new Locale("pt-BR"));
            Random rnd = new Random();

            String password1 = passwordEncoder.encode("123");
            String password2 = passwordEncoder.encode("456");

            Company company1 = new Company("12345678000195", "Teste Comércio S.A.", "61999999999", "testecomercio@gmail.com", password1);
            Company company2 = new Company("61703542949549", "Teste Soluções LTDA", "61988888888", "testesolucoes@gmail.com", password2);

            companyRepository.save(company1);
            departmentRepository.save(new Department("Default", company1));
            companyRepository.save(company2);
            departmentRepository.save(new Department("Default", company2));

            Quotation quotation1 = new Quotation(Instant.parse("2025-12-10T08:00:00Z"), Instant.parse("2026-12-31T10:00:00Z"), false, company1);
            Quotation quotation2 = new Quotation(Instant.parse("2025-12-25T16:00:00Z"), Instant.parse("2025-12-25T18:00:00Z"), true, company1);
            Quotation quotation3 = new Quotation(Instant.parse("2025-11-21T08:00:00Z"), Instant.parse("2025-11-21T10:00:00Z"), false, company1);
            Quotation quotation4 = new Quotation(Instant.parse("2026-01-21T08:00:00Z"), Instant.parse("2026-11-21T10:00:00Z"), false, company1);
            Quotation quotation5 = new Quotation(Instant.parse("2026-02-21T08:00:00Z"), Instant.parse("2026-12-21T10:00:00Z"), false, company1);
            Quotation quotation6 = new Quotation(Instant.parse("2026-03-21T08:00:00Z"), Instant.parse("2026-03-21T10:00:00Z"), false, company1);
            Quotation quotation7 = new Quotation(Instant.parse("2026-04-21T08:00:00Z"), Instant.parse("2026-04-21T10:00:00Z"), false, company1);
            Quotation quotation8 = new Quotation(Instant.parse("2026-05-21T08:00:00Z"), Instant.parse("2026-05-21T10:00:00Z"), false, company1);
            Quotation quotation9 = new Quotation(Instant.parse("2026-10-21T08:00:00Z"), Instant.parse("2026-10-21T10:00:00Z"), false, company1);
            Quotation quotation10 = new Quotation(Instant.parse("2026-11-21T08:00:00Z"), Instant.parse("2026-11-21T10:00:00Z"), false, company1);
            Quotation quotation11 = new Quotation(Instant.parse("2027-11-21T08:00:00Z"), Instant.parse("2027-08-21T10:00:00Z"), false, company1);

            quotationRepository.save(quotation1);
            quotationRepository.save(quotation2);
            quotationRepository.save(quotation3);
            quotationRepository.save(quotation4);
            quotationRepository.save(quotation5);
            quotationRepository.save(quotation6);
            quotationRepository.save(quotation7);
            quotationRepository.save(quotation8);
            quotationRepository.save(quotation9);
            quotationRepository.save(quotation10);
            quotationRepository.save(quotation11);

            Department department1 = departmentRepository.findByCompany_CompanyEmail(company1.getCompanyEmail()).getFirst();
            Department department2 = departmentRepository.findByCompany_CompanyEmail(company2.getCompanyEmail()).getFirst();

            for(int i = 0; i < 26; i++){

                String barcode = String.format("%013d", Math.abs(rnd.nextLong()) % 10000000000000L);

                if(i < 21){
                    Supplier supplier = new Supplier(faker.name().firstName(), "contact" + i + "@gmail.com", "6199999999" + i, faker.company().name(), generateValidCnpj(rnd), passwordEncoder.encode("password"), company1);
                    Product product = new Product(faker.commerce().productName(), barcode, faker.commerce().material(), company1, department1);
                    supplierRepository.save(supplier);
                    productRepository.save(product);
                }else{
                    Supplier supplier = new Supplier(faker.name().firstName(), "contact" + i + "@gmail.com", "6199999999" + i, faker.company().name(), generateValidCnpj(rnd), passwordEncoder.encode("password"), company2);
                    Product product = new Product(faker.commerce().productName(), barcode, faker.commerce().material(), company2, department2);
                    supplierRepository.save(supplier);
                    productRepository.save(product);
                }
            }

            List<Product> products = productRepository.findAll();
            Contain contain1 = new Contain(quotation1, products.get(0), BigDecimal.valueOf(10.0), BigDecimal.valueOf(0.0), "Brand 1", UnitOfMeasure.UND);
            Contain contain2 = new Contain(quotation1, products.get(1), BigDecimal.valueOf(5.0), BigDecimal.valueOf(3.0), "Brand 2", UnitOfMeasure.CX);
            Contain contain3 = new Contain(quotation1, products.get(2), BigDecimal.valueOf(7.0), BigDecimal.valueOf(2.0), "Brand 3", UnitOfMeasure.KG);
            Contain contain4 = new Contain(quotation1, products.get(3), BigDecimal.valueOf(25.0), BigDecimal.valueOf(1.0), null, UnitOfMeasure.balde);
            Contain contain5 = new Contain(quotation2, products.get(2), BigDecimal.valueOf(2.0), BigDecimal.valueOf(0.0), null, UnitOfMeasure.bag);

            containRepository.save(contain1);
            containRepository.save(contain2);
            containRepository.save(contain3);
            containRepository.save(contain4);
            containRepository.save(contain5);

            List<Supplier> suppliers = supplierRepository.findAll();
            Participation participation1 = new Participation(quotation1, suppliers.get(0));
            Participation participation2 = new Participation(quotation1, suppliers.get(1));
            Participation participation3 = new Participation(quotation2, suppliers.get(2));
            Participation participation4 = new Participation(quotation3, suppliers.get(0));

            participationRepository.save(participation1);
            participationRepository.save(participation2);
            participationRepository.save(participation3);
            participationRepository.save(participation4);

            Bid bid1 = new Bid(participation1, products.getFirst(), BigDecimal.valueOf(100.0), BigDecimal.valueOf(10.0), BigDecimal.valueOf(1.0));
            Bid bid2 = new Bid(participation2, products.getFirst(), BigDecimal.valueOf(95.0), BigDecimal.valueOf(10.0), BigDecimal.valueOf(0.0));
            Bid bid3 = new Bid(participation1, products.get(1), BigDecimal.valueOf(200.0), BigDecimal.valueOf(5.0), BigDecimal.valueOf(0.0));

            bidRepository.save(bid1);
            bidRepository.save(bid2);
            bidRepository.save(bid3);
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

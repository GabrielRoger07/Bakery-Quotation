package com.bakeryquotation.backend.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.bakeryquotation.backend.Company.Company;
import com.bakeryquotation.backend.Supplier.Supplier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class TokenConfig {

    @Value("${api.security.token.secret}")
    private String secret;

    @Value("${api.security.token.company.expiration}")
    private Long companyTokenExpiration;

    @Value("${api.security.token.company.refresh-token.expiration}")
    private Long companyRefreshTokenExpiration;

    @Value("${api.security.token.supplier.expiration}")
    private Long supplierTokenExpiration;

    @Value("${api.security.token.supplier.refresh-token.expiration}")
    private Long supplierRefreshTokenExpiration;

    public String generateToken(Company company){

        Algorithm algorithm = Algorithm.HMAC256(secret);

        return JWT.create()
                .withSubject(company.getCompanyEmail())
                .withClaim("companyCnpj", company.getCompanyCnpj())
                .withClaim("userType", "COMPANY")
                .withExpiresAt(Instant.now().plusSeconds(companyTokenExpiration))
                .withIssuedAt(Instant.now())
                .sign(algorithm);
    }

    public String generateRefreshToken(Company company){

        Algorithm algorithm = Algorithm.HMAC256(secret);

        return JWT.create()
                .withSubject(company.getCompanyEmail())
                .withClaim("companyCnpj", company.getCompanyCnpj())
                .withClaim("userType", "COMPANY")
                .withExpiresAt(Instant.now().plusSeconds(companyRefreshTokenExpiration))
                .withIssuedAt(Instant.now())
                .sign(algorithm);
    }

    public String generateSupplierToken(Supplier supplier){

        Algorithm algorithm = Algorithm.HMAC256(secret);

        return JWT.create()
                .withSubject(supplier.getId().toString())
                .withClaim("userType", "SUPPLIER")
                .withExpiresAt(Instant.now().plusSeconds(supplierTokenExpiration))
                .withIssuedAt(Instant.now())
                .sign(algorithm);
    }

    public String generateSupplierRefreshToken(Supplier supplier){

        Algorithm algorithm = Algorithm.HMAC256(secret);

        return JWT.create()
                .withSubject(supplier.getId().toString())
                .withClaim("userType", "SUPPLIER")
                .withExpiresAt(Instant.now().plusSeconds(supplierRefreshTokenExpiration))
                .withIssuedAt(Instant.now())
                .sign(algorithm);
    }

    public String validateToken(String accessToken){

        Algorithm algorithm = Algorithm.HMAC256(secret);

        try{
            return JWT.require(algorithm)
                    .build()
                    .verify(accessToken)
                    .getSubject();
        }catch(JWTVerificationException exception){
            return null;
        }
    }

    public String getUserTypeFromToken(String accessToken){

        Algorithm algorithm = Algorithm.HMAC256(secret);

        try{
            return JWT.require(algorithm)
                    .build()
                    .verify(accessToken)
                    .getClaim("userType")
                    .asString();
        }catch(JWTVerificationException exception){
            return null;
        }
    }
}

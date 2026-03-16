package com.bakeryquotation.backend.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.bakeryquotation.backend.Company.Company;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class TokenConfig {

    @Value("${api.security.token.secret}")
    private String secret;

    @Value("${api.security.token.expiration}")
    private Long expiration;

    @Value("${api.security.token.refresh-token.expiration}")
    private Long refreshTokenExpiration;

    public String generateToken(Company company){

        Algorithm algorithm = Algorithm.HMAC256(secret);

        return JWT.create()
                .withSubject(company.getCompanyEmail())
                .withClaim("companyCnpj", company.getCompanyCnpj())
                .withExpiresAt(Instant.now().plusSeconds(expiration))
                .withIssuedAt(Instant.now())
                .sign(algorithm);
    }

    public String generateRefreshToken(Company company){

        Algorithm algorithm = Algorithm.HMAC256(secret);

        return JWT.create()
                .withSubject(company.getCompanyEmail())
                .withClaim("companyCnpj", company.getCompanyCnpj())
                .withExpiresAt(Instant.now().plusSeconds(refreshTokenExpiration))
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
}

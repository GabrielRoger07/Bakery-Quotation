package com.bakeryquotation.backend.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.bakeryquotation.backend.Company.Company;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class TokenConfig {

    @Value("${api.security.token.secret}")
    private String secret;

    public String generateToken(Company company){

        Algorithm algorithm = Algorithm.HMAC256(secret);

        return JWT.create()
                .withSubject(company.getCompanyEmail())
                .withClaim("companyCnpj", company.getCompanyCnpj())
                .withExpiresAt(Instant.now().plusSeconds(10))
                .withIssuedAt(Instant.now())
                .sign(algorithm);
    }

    public String validateToken(String token){

        Algorithm algorithm = Algorithm.HMAC256(secret);

        try{
            return JWT.require(algorithm).build().verify(token).getSubject();
        }catch(JWTVerificationException exception){
            return null;
        }
    }
}

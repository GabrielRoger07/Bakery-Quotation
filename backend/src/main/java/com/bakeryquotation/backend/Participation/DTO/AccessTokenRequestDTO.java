package com.bakeryquotation.backend.Participation.DTO;

import jakarta.validation.constraints.NotNull;

public class AccessTokenRequestDTO {

    @NotNull(message = "Access Token is required")
    private String accessToken;

    public AccessTokenRequestDTO() {
    }

    public AccessTokenRequestDTO(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
}

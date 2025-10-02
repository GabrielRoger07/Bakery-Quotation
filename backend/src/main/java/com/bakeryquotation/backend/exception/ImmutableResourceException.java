package com.bakeryquotation.backend.exception;

public class ImmutableResourceException extends RuntimeException {
    public ImmutableResourceException(String message) {
        super(message);
    }

    public ImmutableResourceException(String message, Throwable cause){
        super(message, cause);
    }
}

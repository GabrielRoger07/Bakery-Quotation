package com.bakeryquotation.backend.exception;

public class ImmutableIdentifierException extends RuntimeException {
    public ImmutableIdentifierException(String message) {
        super(message);
    }

    public ImmutableIdentifierException(String message, Throwable cause){
        super(message, cause);
    }
}

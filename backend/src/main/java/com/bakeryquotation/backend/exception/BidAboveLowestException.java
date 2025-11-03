package com.bakeryquotation.backend.exception;

public class BidAboveLowestException extends RuntimeException {
    public BidAboveLowestException(String message) {
        super(message);
    }

    public BidAboveLowestException(String message, Throwable cause) {
        super(message, cause);
    }
}
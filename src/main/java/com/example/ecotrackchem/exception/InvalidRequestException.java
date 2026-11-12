package com.example.ecotrackchem.exception;

public class InvalidRequestException extends RuntimeException {
    public InvalidRequestException(String mensaje) {
        super(mensaje);
    }
}

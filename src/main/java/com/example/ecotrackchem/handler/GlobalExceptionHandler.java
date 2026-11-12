package com.example.ecotrackchem.handler;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.jspecify.annotations.Nullable;
import org.springframework.beans.TypeMismatchException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.example.ecotrackchem.components.RestSecurityErrorHandler;
import com.example.ecotrackchem.exception.BusinessRuleException;
import com.example.ecotrackchem.exception.InvalidRequestException;
import com.example.ecotrackchem.exception.ResourceNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @Override
    protected @Nullable ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {

        Map<String, String> errores = new LinkedHashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String campo = error instanceof FieldError fieldError ? fieldError.getField() : error.getObjectName();
            errores.putIfAbsent(campo, error.getDefaultMessage());
        });

        return construirRespuesta(HttpStatus.BAD_REQUEST, "Error de validacion", errores);
    }

    @Override
    protected @Nullable ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return construirRespuesta(HttpStatus.BAD_REQUEST,
                "El cuerpo de la solicitud no es valido. Revisa el formato JSON, las fechas y los valores de los catalogos",
                null);
    }

    @Override
    protected @Nullable ResponseEntity<Object> handleTypeMismatch(TypeMismatchException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        String parametro = ex.getPropertyName() != null ? ex.getPropertyName() : "parametro";
        return construirRespuesta(HttpStatus.BAD_REQUEST,
                "El valor '" + ex.getValue() + "' no es valido para " + parametro, null);
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<Object> handleInvalidRequest(InvalidRequestException ex) {
        return construirRespuesta(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFound(ResourceNotFoundException ex) {
        return construirRespuesta(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<Object> handleBusinessRule(BusinessRuleException ex) {
        return construirRespuesta(HttpStatus.CONFLICT, ex.getMessage(), null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        return construirRespuesta(HttpStatus.CONFLICT,
                "El registro entra en conflicto con datos existentes (posible valor duplicado)", null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Object> handleBadCredentials(BadCredentialsException ex) {
        return construirRespuesta(HttpStatus.UNAUTHORIZED, "Correo o clave incorrectos", null);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Object> handleAuthenticationException(AuthenticationException ex) {
        return construirRespuesta(HttpStatus.UNAUTHORIZED, RestSecurityErrorHandler.MENSAJE_NO_AUTENTICADO, null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDenied(AccessDeniedException ex) {
        String mensaje = ex.getMessage() != null && !ex.getMessage().isBlank()
                ? ex.getMessage()
                : RestSecurityErrorHandler.MENSAJE_SIN_PERMISOS;
        return construirRespuesta(HttpStatus.FORBIDDEN, mensaje, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGenericException(Exception ex) {
        return construirRespuesta(HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocurrio un error interno en el servidor", Map.of("detalle", String.valueOf(ex.getMessage())));
    }

    private ResponseEntity<Object> construirRespuesta(HttpStatus status, String error, Map<String, String> detalles) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", status.value());
        response.put("error", error);
        if (detalles != null) {
            response.put("details", detalles);
        }
        return new ResponseEntity<>(response, status);
    }
}

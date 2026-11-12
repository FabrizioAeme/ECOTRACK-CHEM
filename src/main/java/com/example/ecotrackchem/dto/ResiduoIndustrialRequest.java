package com.example.ecotrackchem.dto;

import java.math.BigDecimal;

import com.example.ecotrackchem.util.DisposicionFinal;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ResiduoIndustrialRequest(
        @NotBlank(message = "El tipo de residuo es obligatorio")
        @Size(max = 100, message = "El tipo de residuo no puede superar los 100 caracteres")
        String tipoResiduo,

        @NotNull(message = "El volumen en litros es obligatorio")
        @Positive(message = "El volumen en litros debe ser mayor que 0")
        @Digits(integer = 8, fraction = 2, message = "El volumen admite hasta 8 enteros y 2 decimales")
        BigDecimal volumenLitros,

        @NotNull(message = "La disposicion final es obligatoria")
        DisposicionFinal disposicionFinal,

        @NotNull(message = "Debe indicar si el residuo requiere certificado")
        Boolean requiereCertificado,

        @NotNull(message = "Debe indicar el id del lote que genero el residuo")
        Integer loteId) {
}

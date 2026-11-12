package com.example.ecotrackchem.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.ecotrackchem.util.EstadoLote;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record LoteRequest(
        @NotBlank(message = "El codigo del lote es obligatorio")
        @Size(max = 30, message = "El codigo del lote no puede superar los 30 caracteres")
        String codigoLote,

        @NotNull(message = "La fecha de fabricacion es obligatoria")
        @PastOrPresent(message = "La fecha de fabricacion no puede ser futura")
        LocalDate fechaFabricacion,

        @NotNull(message = "El volumen producido es obligatorio")
        @Positive(message = "El volumen producido debe ser mayor que 0")
        @Digits(integer = 8, fraction = 2, message = "El volumen admite hasta 8 enteros y 2 decimales")
        BigDecimal volumenProducido,

        @NotNull(message = "El estado del lote es obligatorio")
        EstadoLote estado,

        @NotNull(message = "Debe indicar el id del usuario que autoriza el lote")
        Integer usuarioId,

        @NotNull(message = "Debe indicar el id del insumo quimico principal")
        Integer insumoId) {
}

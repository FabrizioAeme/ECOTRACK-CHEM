package com.example.ecotrackchem.dto;

import java.math.BigDecimal;

import com.example.ecotrackchem.util.NivelPeligrosidad;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record InsumoQuimicoRequest(
        @NotBlank(message = "El codigo CAS es obligatorio")
        @Pattern(regexp = "^\\s*\\d{2,7}-\\d{2}-\\d\\s*$", message = "El codigo CAS debe tener el formato NN-NN-N, ej. 7732-18-5")
        String codigoCas,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150, message = "El nombre no puede superar los 150 caracteres")
        String nombre,

        @NotNull(message = "El nivel de pureza es obligatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "El nivel de pureza debe ser mayor que 0")
        @DecimalMax(value = "100.0", inclusive = true, message = "El nivel de pureza es un porcentaje entre 0 y 100")
        @Digits(integer = 3, fraction = 2, message = "El nivel de pureza admite hasta 2 decimales")
        BigDecimal nivelPureza,

        @NotNull(message = "El nivel de peligrosidad es obligatorio")
        NivelPeligrosidad nivelPeligrosidad,

        @NotNull(message = "El stock disponible es obligatorio")
        @PositiveOrZero(message = "El stock disponible no puede ser negativo")
        @Digits(integer = 8, fraction = 2, message = "El stock admite hasta 8 enteros y 2 decimales")
        BigDecimal stockDisponible) {
}

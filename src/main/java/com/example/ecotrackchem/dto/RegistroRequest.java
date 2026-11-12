package com.example.ecotrackchem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistroRequest(
        @NotBlank(message = "Los nombres son obligatorios")
        @Size(max = 100, message = "Los nombres no pueden superar los 100 caracteres")
        String nombres,

        @NotBlank(message = "Los apellidos son obligatorios")
        @Size(max = 100, message = "Los apellidos no pueden superar los 100 caracteres")
        String apellidos,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato valido")
        @Size(max = 150, message = "El correo no puede superar los 150 caracteres")
        String correo,

        @NotBlank(message = "La clave es obligatoria")
        @Size(min = 6, max = 60, message = "La clave debe tener entre 6 y 60 caracteres")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "La clave debe contener al menos una letra y un numero")
        String clave) {
}

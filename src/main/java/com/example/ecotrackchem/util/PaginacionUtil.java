package com.example.ecotrackchem.util;

import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.example.ecotrackchem.exception.InvalidRequestException;

public final class PaginacionUtil {

    public static final int TAMANIO_MAXIMO = 50;

    private PaginacionUtil() {
    }

    public static Pageable crear(int pagina, int tamanio, String ordenarPor, String direccion,
            Set<String> camposPermitidos) {
        if (pagina < 0) {
            throw new InvalidRequestException("El numero de pagina no puede ser negativo");
        }
        if (tamanio < 1 || tamanio > TAMANIO_MAXIMO) {
            throw new InvalidRequestException("El tamanio de pagina debe estar entre 1 y " + TAMANIO_MAXIMO);
        }
        if (!camposPermitidos.contains(ordenarPor)) {
            throw new InvalidRequestException("No se puede ordenar por '" + ordenarPor + "'. Campos permitidos: "
                    + String.join(", ", camposPermitidos));
        }
        Sort.Direction sentido = "desc".equalsIgnoreCase(direccion) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort orden = Sort.by(sentido, ordenarPor);
        if (!"id".equals(ordenarPor)) {
            orden = orden.and(Sort.by(Sort.Direction.DESC, "id"));
        }
        return PageRequest.of(pagina, tamanio, orden);
    }

    public static String normalizarBusqueda(String texto) {
        return texto == null ? "" : texto.trim().toLowerCase();
    }
}

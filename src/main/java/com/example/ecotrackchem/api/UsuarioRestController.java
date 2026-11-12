package com.example.ecotrackchem.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecotrackchem.dto.UsuarioResponse;
import com.example.ecotrackchem.service.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/v1/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Consulta de usuarios. El listado y el detalle requieren rol ADMINISTRADOR")
public class UsuarioRestController {

    private final UsuarioService service;

    @Operation(summary = "Perfil del usuario autenticado", description = "Disponible para cualquier rol")
    @ApiResponse(responseCode = "200", description = "Datos del usuario del token")
    @ApiResponse(responseCode = "401", description = "Token ausente, invalido o expirado")
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> perfil() {
        return ResponseEntity.ok(service.getPerfil());
    }

    @Operation(summary = "Listar usuarios", description = "Solo ADMINISTRADOR")
    @ApiResponse(responseCode = "200", description = "Listado de usuarios")
    @ApiResponse(responseCode = "403", description = "El usuario no es administrador")
    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listar() {
        return ResponseEntity.ok(service.getAllUsuarios());
    }

    @Operation(summary = "Ver detalle de un usuario", description = "Solo ADMINISTRADOR")
    @ApiResponse(responseCode = "200", description = "Usuario encontrado")
    @ApiResponse(responseCode = "403", description = "El usuario no es administrador")
    @ApiResponse(responseCode = "404", description = "No existe un usuario con ese id")
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> verDetalle(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getUsuarioById(id));
    }
}

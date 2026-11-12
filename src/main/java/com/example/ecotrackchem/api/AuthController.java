package com.example.ecotrackchem.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecotrackchem.dto.AuthRequest;
import com.example.ecotrackchem.dto.AuthResponse;
import com.example.ecotrackchem.dto.RegistroRequest;
import com.example.ecotrackchem.dto.RegistroResponse;
import com.example.ecotrackchem.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
@SecurityRequirements
@Tag(name = "Autenticacion", description = "Registro de cuentas e inicio de sesion con JWT")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Registrar una cuenta", description = "Crea un usuario con rol OPERADOR_LABORATORIO")
    @ApiResponse(responseCode = "201", description = "Cuenta creada")
    @ApiResponse(responseCode = "400", description = "Datos invalidos")
    @ApiResponse(responseCode = "409", description = "El correo ya esta registrado")
    @PostMapping("/register")
    public ResponseEntity<RegistroResponse> register(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @Operation(summary = "Iniciar sesion", description = "Devuelve el access_token (JWT) que se envia en el header Authorization: Bearer <token>")
    @ApiResponse(responseCode = "200", description = "Credenciales correctas")
    @ApiResponse(responseCode = "401", description = "Correo o contrasena incorrectos")
    @PostMapping("/authenticate")
    public ResponseEntity<AuthResponse> authenticate(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }
}

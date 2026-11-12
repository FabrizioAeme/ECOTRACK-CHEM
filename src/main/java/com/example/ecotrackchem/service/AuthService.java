package com.example.ecotrackchem.service;

import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.ecotrackchem.dto.AuthRequest;
import com.example.ecotrackchem.dto.AuthResponse;
import com.example.ecotrackchem.dto.RegistroRequest;
import com.example.ecotrackchem.dto.RegistroResponse;
import com.example.ecotrackchem.exception.BusinessRuleException;
import com.example.ecotrackchem.model.Usuario;
import com.example.ecotrackchem.repository.UsuarioRepository;
import com.example.ecotrackchem.util.RolUsuario;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public RegistroResponse register(RegistroRequest request) {
        String correo = normalizarCorreo(request.correo());
        if (userRepository.findByCorreo(correo).isPresent()) {
            throw new BusinessRuleException("Ya existe una cuenta registrada con el correo " + correo);
        }
        var user = Usuario.builder()
                .nombres(request.nombres().trim())
                .apellidos(request.apellidos().trim())
                .correo(correo)
                .clave(passwordEncoder.encode(request.clave()))
                .rol(RolUsuario.OPERADOR_LABORATORIO)
                .build();
        userRepository.save(user);
        return new RegistroResponse(correo, "INFORMATION", "Usuario registrado correctamente.");
    }

    public AuthResponse authenticate(AuthRequest request) {
        String correo = normalizarCorreo(request.correo());
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(correo, request.clave()));
        var user = userRepository.findByCorreo(correo).orElseThrow();
        Map<String, Object> claims = Map.of(
                "rol", user.getRol().name(),
                "nombre", user.getNombres() + " " + user.getApellidos(),
                "id", user.getId());
        var jwtToken = jwtService.generateToken(claims, user);
        var refreshToken = jwtService.generateRefreshToken(user);
        return new AuthResponse(jwtToken, refreshToken);
    }

    private String normalizarCorreo(String correo) {
        return correo.trim().toLowerCase();
    }
}

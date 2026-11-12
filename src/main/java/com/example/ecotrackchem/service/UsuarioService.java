package com.example.ecotrackchem.service;

import java.util.List;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.ecotrackchem.dto.UsuarioResponse;
import com.example.ecotrackchem.exception.ResourceNotFoundException;
import com.example.ecotrackchem.mapper.UsuarioMapper;
import com.example.ecotrackchem.model.Usuario;
import com.example.ecotrackchem.repository.UsuarioRepository;
import com.example.ecotrackchem.util.RolUsuario;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository repository;
    private final UsuarioMapper mapper;

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        return repository.findByCorreo(correo.trim().toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + correo));
    }

    public List<UsuarioResponse> getAllUsuarios() {
        return repository.findAll().stream()
                .map(mapper::toDto)
                .toList();
    }

    public UsuarioResponse getUsuarioById(Integer id) {
        return repository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id " + id));
    }

    public UsuarioResponse getPerfil() {
        return mapper.toDto(getUsuarioActual());
    }

    public Usuario getUsuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Usuario usuario)) {
            throw new AuthenticationCredentialsNotFoundException("No hay un usuario autenticado");
        }
        return usuario;
    }

    public boolean tieneRol(RolUsuario... roles) {
        RolUsuario actual = getUsuarioActual().getRol();
        for (RolUsuario rol : roles) {
            if (rol == actual) {
                return true;
            }
        }
        return false;
    }
}

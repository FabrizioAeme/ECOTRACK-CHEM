package com.example.ecotrackchem.service;

import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ecotrackchem.dto.LoteRequest;
import com.example.ecotrackchem.dto.LoteResponse;
import com.example.ecotrackchem.dto.PaginaResponse;
import com.example.ecotrackchem.exception.BusinessRuleException;
import com.example.ecotrackchem.exception.ResourceNotFoundException;
import com.example.ecotrackchem.mapper.LoteMapper;
import com.example.ecotrackchem.model.InsumoQuimico;
import com.example.ecotrackchem.model.Lote;
import com.example.ecotrackchem.model.Usuario;
import com.example.ecotrackchem.repository.InsumoQuimicoRepository;
import com.example.ecotrackchem.repository.LoteRepository;
import com.example.ecotrackchem.repository.ResiduoIndustrialRepository;
import com.example.ecotrackchem.repository.UsuarioRepository;
import com.example.ecotrackchem.util.EstadoLote;
import com.example.ecotrackchem.util.PaginacionUtil;
import com.example.ecotrackchem.util.RolUsuario;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoteService {

    public static final Set<String> CAMPOS_ORDEN = Set.of("id", "codigoLote", "fechaFabricacion",
            "volumenProducido", "estado");

    private final LoteRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final InsumoQuimicoRepository insumoRepository;
    private final ResiduoIndustrialRepository residuoRepository;
    private final UsuarioService usuarioService;
    private final LoteMapper mapper;

    @Transactional(readOnly = true)
    public List<LoteResponse> getAll() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "fechaFabricacion", "id")).stream()
                .map(mapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public PaginaResponse<LoteResponse> getPagina(String buscar, EstadoLote estado, int pagina, int tamanio,
            String ordenarPor, String direccion) {
        Pageable pageable = PaginacionUtil.crear(pagina, tamanio, ordenarPor, direccion, CAMPOS_ORDEN);
        return PaginaResponse.desde(
                repository.buscar(PaginacionUtil.normalizarBusqueda(buscar), estado, pageable),
                mapper::toDto);
    }

    @Transactional(readOnly = true)
    public LoteResponse getById(Integer id) {
        return mapper.toDto(buscarLote(id));
    }

    @Transactional
    public LoteResponse create(LoteRequest request) {
        String codigo = normalizarCodigo(request.codigoLote());
        if (repository.findByCodigoLote(codigo).isPresent()) {
            throw new BusinessRuleException("Ya existe un lote registrado con el codigo " + codigo);
        }
        if (request.estado() == EstadoLote.AUDITADO) {
            throw new BusinessRuleException("Un lote nuevo no puede registrarse directamente como AUDITADO");
        }
        validarResponsable(request.usuarioId());

        Lote lote = Lote.builder()
                .codigoLote(codigo)
                .fechaFabricacion(request.fechaFabricacion())
                .volumenProducido(request.volumenProducido())
                .estado(request.estado())
                .usuario(buscarUsuario(request.usuarioId()))
                .insumoPrincipal(buscarInsumo(request.insumoId()))
                .build();

        return mapper.toDto(repository.save(lote));
    }

    @Transactional
    public LoteResponse update(Integer id, LoteRequest request) {
        Lote lote = buscarLote(id);
        if (lote.getEstado() == EstadoLote.AUDITADO) {
            throw new BusinessRuleException("El lote " + lote.getCodigoLote()
                    + " ya fue auditado y no puede modificarse");
        }
        String codigo = normalizarCodigo(request.codigoLote());
        if (repository.existsByCodigoLoteAndIdNot(codigo, id)) {
            throw new BusinessRuleException("Ya existe otro lote registrado con el codigo " + codigo);
        }
        if (request.estado().ordinal() < lote.getEstado().ordinal()) {
            throw new BusinessRuleException("El estado del lote no puede retroceder de " + lote.getEstado()
                    + " a " + request.estado());
        }
        if (request.estado() == EstadoLote.AUDITADO
                && !usuarioService.tieneRol(RolUsuario.AUDITOR_AMBIENTAL, RolUsuario.ADMINISTRADOR)) {
            throw new AccessDeniedException("Solo un auditor ambiental o un administrador puede marcar un lote como AUDITADO");
        }
        if (!lote.getUsuario().getId().equals(request.usuarioId())) {
            validarResponsable(request.usuarioId());
        }

        lote.setCodigoLote(codigo);
        lote.setFechaFabricacion(request.fechaFabricacion());
        lote.setVolumenProducido(request.volumenProducido());
        lote.setEstado(request.estado());
        lote.setUsuario(buscarUsuario(request.usuarioId()));
        lote.setInsumoPrincipal(buscarInsumo(request.insumoId()));

        return mapper.toDto(repository.save(lote));
    }

    @Transactional
    public void delete(Integer id) {
        Lote lote = buscarLote(id);
        if (lote.getEstado() == EstadoLote.AUDITADO) {
            throw new BusinessRuleException("El lote " + lote.getCodigoLote() + " ya fue auditado y no puede eliminarse");
        }
        long residuos = residuoRepository.countByLoteId(id);
        if (residuos > 0) {
            throw new BusinessRuleException("No se puede eliminar el lote " + lote.getCodigoLote()
                    + " porque tiene " + residuos + " residuo(s) registrado(s)");
        }
        repository.delete(lote);
    }

    private void validarResponsable(Integer usuarioId) {
        Usuario actual = usuarioService.getUsuarioActual();
        if (actual.getRol() != RolUsuario.ADMINISTRADOR && !actual.getId().equals(usuarioId)) {
            throw new AccessDeniedException("Solo un administrador puede registrar lotes a nombre de otro usuario");
        }
    }

    private String normalizarCodigo(String codigo) {
        return codigo.trim().toUpperCase();
    }

    private Lote buscarLote(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado con id " + id));
    }

    private Usuario buscarUsuario(Integer id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id " + id));
    }

    private InsumoQuimico buscarInsumo(Integer id) {
        return insumoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insumo quimico no encontrado con id " + id));
    }
}

package com.example.ecotrackchem.service;

import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ecotrackchem.dto.InsumoQuimicoRequest;
import com.example.ecotrackchem.dto.InsumoQuimicoResponse;
import com.example.ecotrackchem.dto.PaginaResponse;
import com.example.ecotrackchem.exception.BusinessRuleException;
import com.example.ecotrackchem.exception.ResourceNotFoundException;
import com.example.ecotrackchem.mapper.InsumoQuimicoMapper;
import com.example.ecotrackchem.model.InsumoQuimico;
import com.example.ecotrackchem.repository.InsumoQuimicoRepository;
import com.example.ecotrackchem.repository.LoteRepository;
import com.example.ecotrackchem.util.NivelPeligrosidad;
import com.example.ecotrackchem.util.PaginacionUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InsumoQuimicoService {

    public static final Set<String> CAMPOS_ORDEN = Set.of("id", "codigoCas", "nombre", "nivelPureza",
            "nivelPeligrosidad", "stockDisponible");

    private final InsumoQuimicoRepository repository;
    private final LoteRepository loteRepository;
    private final InsumoQuimicoMapper mapper;

    @Transactional(readOnly = true)
    public List<InsumoQuimicoResponse> getAll() {
        return repository.findAll(Sort.by("nombre")).stream()
                .map(mapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public PaginaResponse<InsumoQuimicoResponse> getPagina(String buscar, NivelPeligrosidad nivel, int pagina,
            int tamanio, String ordenarPor, String direccion) {
        Pageable pageable = PaginacionUtil.crear(pagina, tamanio, ordenarPor, direccion, CAMPOS_ORDEN);
        return PaginaResponse.desde(
                repository.buscar(PaginacionUtil.normalizarBusqueda(buscar), nivel, pageable),
                mapper::toDto);
    }

    @Transactional(readOnly = true)
    public InsumoQuimicoResponse getById(Integer id) {
        return mapper.toDto(buscar(id));
    }

    @Transactional
    public InsumoQuimicoResponse create(InsumoQuimicoRequest request) {
        String codigoCas = request.codigoCas().trim();
        if (repository.findByCodigoCas(codigoCas).isPresent()) {
            throw new BusinessRuleException("Ya existe un insumo registrado con el codigo CAS " + codigoCas);
        }
        InsumoQuimico entity = mapper.toEntity(request);
        return mapper.toDto(repository.save(entity));
    }

    @Transactional
    public InsumoQuimicoResponse update(Integer id, InsumoQuimicoRequest request) {
        InsumoQuimico entity = buscar(id);
        String codigoCas = request.codigoCas().trim();
        if (repository.existsByCodigoCasAndIdNot(codigoCas, id)) {
            throw new BusinessRuleException("Ya existe otro insumo registrado con el codigo CAS " + codigoCas);
        }
        mapper.actualizarEntity(entity, request);
        return mapper.toDto(repository.save(entity));
    }

    @Transactional
    public void delete(Integer id) {
        InsumoQuimico entity = buscar(id);
        long lotes = loteRepository.countByInsumoPrincipalId(id);
        if (lotes > 0) {
            throw new BusinessRuleException("No se puede eliminar el insumo " + entity.getNombre()
                    + " porque esta asociado a " + lotes + " lote(s) de produccion");
        }
        repository.delete(entity);
    }

    private InsumoQuimico buscar(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insumo quimico no encontrado con id " + id));
    }
}

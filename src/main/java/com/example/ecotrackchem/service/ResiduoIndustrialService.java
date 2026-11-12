package com.example.ecotrackchem.service;

import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ecotrackchem.dto.PaginaResponse;
import com.example.ecotrackchem.dto.ResiduoIndustrialRequest;
import com.example.ecotrackchem.dto.ResiduoIndustrialResponse;
import com.example.ecotrackchem.exception.BusinessRuleException;
import com.example.ecotrackchem.exception.InvalidRequestException;
import com.example.ecotrackchem.exception.ResourceNotFoundException;
import com.example.ecotrackchem.mapper.ResiduoIndustrialMapper;
import com.example.ecotrackchem.model.Lote;
import com.example.ecotrackchem.model.ResiduoIndustrial;
import com.example.ecotrackchem.repository.LoteRepository;
import com.example.ecotrackchem.repository.ResiduoIndustrialRepository;
import com.example.ecotrackchem.util.DisposicionFinal;
import com.example.ecotrackchem.util.EstadoLote;
import com.example.ecotrackchem.util.PaginacionUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResiduoIndustrialService {

    public static final Set<String> CAMPOS_ORDEN = Set.of("id", "tipoResiduo", "volumenLitros",
            "disposicionFinal", "requiereCertificado");

    private final ResiduoIndustrialRepository repository;
    private final LoteRepository loteRepository;
    private final ResiduoIndustrialMapper mapper;

    @Transactional(readOnly = true)
    public List<ResiduoIndustrialResponse> getAll() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(mapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public PaginaResponse<ResiduoIndustrialResponse> getPagina(String buscar, DisposicionFinal disposicion,
            int pagina, int tamanio, String ordenarPor, String direccion) {
        Pageable pageable = PaginacionUtil.crear(pagina, tamanio, ordenarPor, direccion, CAMPOS_ORDEN);
        return PaginaResponse.desde(
                repository.buscar(PaginacionUtil.normalizarBusqueda(buscar), disposicion, pageable),
                mapper::toDto);
    }

    @Transactional(readOnly = true)
    public ResiduoIndustrialResponse getById(Integer id) {
        return mapper.toDto(buscarResiduo(id));
    }

    @Transactional
    public ResiduoIndustrialResponse create(ResiduoIndustrialRequest request) {
        validarCertificado(request);
        Lote lote = buscarLoteEditable(request.loteId());
        ResiduoIndustrial entity = mapper.toEntity(request, lote);
        return mapper.toDto(repository.save(entity));
    }

    @Transactional
    public ResiduoIndustrialResponse update(Integer id, ResiduoIndustrialRequest request) {
        ResiduoIndustrial entity = buscarResiduo(id);
        validarLoteEditable(entity.getLote());
        validarCertificado(request);
        Lote lote = buscarLoteEditable(request.loteId());
        mapper.actualizarEntity(entity, request, lote);
        return mapper.toDto(repository.save(entity));
    }

    @Transactional
    public void delete(Integer id) {
        ResiduoIndustrial entity = buscarResiduo(id);
        validarLoteEditable(entity.getLote());
        repository.delete(entity);
    }

    private void validarCertificado(ResiduoIndustrialRequest request) {
        if (request.disposicionFinal() == DisposicionFinal.RECOGIDA_ESPECIAL
                && !Boolean.TRUE.equals(request.requiereCertificado())) {
            throw new InvalidRequestException(
                    "Los residuos con disposicion RECOGIDA_ESPECIAL deben marcarse como que requieren certificado");
        }
    }

    private Lote buscarLoteEditable(Integer loteId) {
        Lote lote = loteRepository.findById(loteId)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado con id " + loteId));
        validarLoteEditable(lote);
        return lote;
    }

    private void validarLoteEditable(Lote lote) {
        if (lote.getEstado() == EstadoLote.AUDITADO) {
            throw new BusinessRuleException("El lote " + lote.getCodigoLote()
                    + " ya fue auditado: no se pueden registrar, modificar ni eliminar sus residuos");
        }
    }

    private ResiduoIndustrial buscarResiduo(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Residuo industrial no encontrado con id " + id));
    }
}

package com.example.ecotrackchem.mapper;

import org.springframework.stereotype.Component;

import com.example.ecotrackchem.dto.ResiduoIndustrialRequest;
import com.example.ecotrackchem.dto.ResiduoIndustrialResponse;
import com.example.ecotrackchem.model.Lote;
import com.example.ecotrackchem.model.ResiduoIndustrial;

@Component
public class ResiduoIndustrialMapper {

    public ResiduoIndustrial toEntity(ResiduoIndustrialRequest dto, Lote lote) {
        return ResiduoIndustrial.builder()
                .tipoResiduo(dto.tipoResiduo().trim())
                .volumenLitros(dto.volumenLitros())
                .disposicionFinal(dto.disposicionFinal())
                .requiereCertificado(dto.requiereCertificado())
                .lote(lote)
                .build();
    }

    public void actualizarEntity(ResiduoIndustrial entity, ResiduoIndustrialRequest dto, Lote lote) {
        entity.setTipoResiduo(dto.tipoResiduo().trim());
        entity.setVolumenLitros(dto.volumenLitros());
        entity.setDisposicionFinal(dto.disposicionFinal());
        entity.setRequiereCertificado(dto.requiereCertificado());
        entity.setLote(lote);
    }

    public ResiduoIndustrialResponse toDto(ResiduoIndustrial entity) {
        return new ResiduoIndustrialResponse(
                entity.getId(),
                entity.getTipoResiduo(),
                entity.getVolumenLitros(),
                entity.getDisposicionFinal(),
                entity.getRequiereCertificado(),
                entity.getLote().getId(),
                entity.getLote().getCodigoLote());
    }
}

package com.example.ecotrackchem.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.ecotrackchem.model.ResiduoIndustrial;
import com.example.ecotrackchem.util.DisposicionFinal;

public interface ResiduoIndustrialRepository extends JpaRepository<ResiduoIndustrial, Integer> {

    List<ResiduoIndustrial> findByLoteId(Integer loteId);

    long countByLoteId(Integer loteId);

    @EntityGraph(attributePaths = { "lote" })
    @Query(value = """
            SELECT r FROM ResiduoIndustrial r JOIN r.lote l
            WHERE (:disposicion IS NULL OR r.disposicionFinal = :disposicion)
              AND (:buscar = ''
                   OR LOWER(r.tipoResiduo) LIKE CONCAT('%', :buscar, '%')
                   OR LOWER(l.codigoLote) LIKE CONCAT('%', :buscar, '%'))
            """, countQuery = """
            SELECT COUNT(r) FROM ResiduoIndustrial r JOIN r.lote l
            WHERE (:disposicion IS NULL OR r.disposicionFinal = :disposicion)
              AND (:buscar = ''
                   OR LOWER(r.tipoResiduo) LIKE CONCAT('%', :buscar, '%')
                   OR LOWER(l.codigoLote) LIKE CONCAT('%', :buscar, '%'))
            """)
    Page<ResiduoIndustrial> buscar(@Param("buscar") String buscar,
            @Param("disposicion") DisposicionFinal disposicion, Pageable pageable);
}

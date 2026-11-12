package com.example.ecotrackchem.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.ecotrackchem.model.InsumoQuimico;
import com.example.ecotrackchem.util.NivelPeligrosidad;

public interface InsumoQuimicoRepository extends JpaRepository<InsumoQuimico, Integer> {

    Optional<InsumoQuimico> findByCodigoCas(String codigoCas);

    boolean existsByCodigoCasAndIdNot(String codigoCas, Integer id);

    @Query("""
            SELECT i FROM InsumoQuimico i
            WHERE (:nivel IS NULL OR i.nivelPeligrosidad = :nivel)
              AND (:buscar = ''
                   OR LOWER(i.nombre) LIKE CONCAT('%', :buscar, '%')
                   OR LOWER(i.codigoCas) LIKE CONCAT('%', :buscar, '%'))
            """)
    Page<InsumoQuimico> buscar(@Param("buscar") String buscar, @Param("nivel") NivelPeligrosidad nivel,
            Pageable pageable);
}

package com.example.ecotrackchem.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.ecotrackchem.model.Lote;
import com.example.ecotrackchem.util.EstadoLote;

public interface LoteRepository extends JpaRepository<Lote, Integer> {

    Optional<Lote> findByCodigoLote(String codigoLote);

    List<Lote> findByEstado(EstadoLote estado);

    boolean existsByCodigoLoteAndIdNot(String codigoLote, Integer id);

    long countByInsumoPrincipalId(Integer insumoId);

    @EntityGraph(attributePaths = { "usuario", "insumoPrincipal" })
    @Query(value = """
            SELECT l FROM Lote l JOIN l.usuario u JOIN l.insumoPrincipal i
            WHERE (:estado IS NULL OR l.estado = :estado)
              AND (:buscar = ''
                   OR LOWER(l.codigoLote) LIKE CONCAT('%', :buscar, '%')
                   OR LOWER(i.nombre) LIKE CONCAT('%', :buscar, '%')
                   OR LOWER(CONCAT(u.nombres, ' ', u.apellidos)) LIKE CONCAT('%', :buscar, '%'))
            """, countQuery = """
            SELECT COUNT(l) FROM Lote l JOIN l.usuario u JOIN l.insumoPrincipal i
            WHERE (:estado IS NULL OR l.estado = :estado)
              AND (:buscar = ''
                   OR LOWER(l.codigoLote) LIKE CONCAT('%', :buscar, '%')
                   OR LOWER(i.nombre) LIKE CONCAT('%', :buscar, '%')
                   OR LOWER(CONCAT(u.nombres, ' ', u.apellidos)) LIKE CONCAT('%', :buscar, '%'))
            """)
    Page<Lote> buscar(@Param("buscar") String buscar, @Param("estado") EstadoLote estado, Pageable pageable);
}

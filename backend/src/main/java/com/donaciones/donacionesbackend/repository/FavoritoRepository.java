package com.donaciones.donacionesbackend.repository;

import com.donaciones.donacionesbackend.entity.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * favoritos de puntos de donación por usuario
 * lo uso en la sección "Mis lugares" del frontend
 */
@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Long> {
    
    List<Favorito> findByUsuarioId(Long usuarioId);
    
    Optional<Favorito> findByUsuarioIdAndPuntoDonacionId(Long usuarioId, Long puntoDonacionId);
    
    void deleteByUsuarioIdAndPuntoDonacionId(Long usuarioId, Long puntoDonacionId);
    
    /** Comprueba rápido si ya marcó ese punto como favorito. */
    boolean existsByUsuarioIdAndPuntoDonacionId(Long usuarioId, Long puntoDonacionId);
}






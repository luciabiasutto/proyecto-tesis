package com.donaciones.donacionesbackend.repository;

import com.donaciones.donacionesbackend.entity.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Long> {
    
    List<Favorito> findByUsuarioId(Long usuarioId);
    
    Optional<Favorito> findByUsuarioIdAndPuntoDonacionId(Long usuarioId, Long puntoDonacionId);
    
    void deleteByUsuarioIdAndPuntoDonacionId(Long usuarioId, Long puntoDonacionId);
    
    boolean existsByUsuarioIdAndPuntoDonacionId(Long usuarioId, Long puntoDonacionId);
}







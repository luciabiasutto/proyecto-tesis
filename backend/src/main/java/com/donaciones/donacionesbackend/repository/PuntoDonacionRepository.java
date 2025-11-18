package com.donaciones.donacionesbackend.repository;

import com.donaciones.donacionesbackend.entity.PuntoDonacion;
import com.donaciones.donacionesbackend.entity.TipoDonacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PuntoDonacionRepository extends JpaRepository<PuntoDonacion, Long> {
    
    // Buscar puntos activos
    List<PuntoDonacion> findByActivoTrue();
    
    // Buscar por tipo de donación
    List<PuntoDonacion> findByTipoDonacionAndActivoTrue(TipoDonacion tipoDonacion);
    
    // Buscar puntos cercanos (usando coordenadas)
    @Query("SELECT p FROM PuntoDonacion p WHERE p.activo = true AND " +
           "6371 * acos(cos(radians(:lat)) * cos(radians(p.latitud)) * " +
           "cos(radians(p.longitud) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(p.latitud))) <= :radio")
    List<PuntoDonacion> findPuntosCercanos(@Param("lat") Double latitud, 
                                          @Param("lng") Double longitud, 
                                          @Param("radio") Double radioKm);
    
    // Buscar por nombre (búsqueda parcial)
    List<PuntoDonacion> findByNombreContainingIgnoreCaseAndActivoTrue(String nombre);
}

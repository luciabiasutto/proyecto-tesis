package com.donaciones.donacionesbackend.repository;

import com.donaciones.donacionesbackend.entity.PuntoDonacion;
import com.donaciones.donacionesbackend.entity.TipoDonacion;
import com.donaciones.donacionesbackend.entity.EstadoPunto;
import com.donaciones.donacionesbackend.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * consultas del mapa y del panel de puntos de donación
 * incluye búsqueda por proximidad con fórmula de Haversine
 */
@Repository
public interface PuntoDonacionRepository extends JpaRepository<PuntoDonacion, Long> {
    
    // Buscar puntos activos
    List<PuntoDonacion> findByActivoTrue();
    
    // Buscar por tipo de donación
    List<PuntoDonacion> findByTipoDonacionAndActivoTrue(TipoDonacion tipoDonacion);
    
    /** puntos dentro de un radio en km desde la ubicación del usuario */
    @Query("SELECT p FROM PuntoDonacion p WHERE p.activo = true AND " +
           "6371 * acos(cos(radians(:lat)) * cos(radians(p.latitud)) * " +
           "cos(radians(p.longitud) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(p.latitud))) <= :radio")
    List<PuntoDonacion> findPuntosCercanos(@Param("lat") Double latitud, 
                                          @Param("lng") Double longitud, 
                                          @Param("radio") Double radioKm);
    
    // Buscar por nombre 
    List<PuntoDonacion> findByNombreContainingIgnoreCaseAndActivoTrue(String nombre);
    
    // Buscar por estado
    List<PuntoDonacion> findByEstado(EstadoPunto estado);
    
    // Buscar por estado y activo
    List<PuntoDonacion> findByActivoTrueAndEstado(EstadoPunto estado);
    
    /** Puntos creados por una organización o admin concreto */
    List<PuntoDonacion> findByUsuarioCreadorIdAndTipoCreador(Long usuarioCreadorId, Rol tipoCreador);
}

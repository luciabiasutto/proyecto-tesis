package com.donaciones.donacionesbackend.repository;

import com.donaciones.donacionesbackend.entity.Donacion;
import com.donaciones.donacionesbackend.entity.EstadoDonacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Consultas sobre donaciones: filtros por estado, punto, fechas y reportes.
 */
@Repository
public interface DonacionRepository extends JpaRepository<Donacion, Long> {
    
    List<Donacion> findByEstado(String estado);
    
    /** Donaciones registradas en un punto específico del mapa. */
    List<Donacion> findByPuntoDonacionId(Long puntoDonacionId);
    
    List<Donacion> findByTipoDonacion(String tipoDonacion);
    
    /** Historial de lo que recibió un beneficiario. */
    List<Donacion> findByBeneficiarioId(Long beneficiarioId);
    
    /** Historial de lo que donó un usuario registrado. */
    List<Donacion> findByDonanteId(Long donanteId);
    
    /** Reportes por rango de fechas para estadísticas del admin. */
    @Query("SELECT d FROM Donacion d WHERE d.fechaDonacion BETWEEN :fechaInicio AND :fechaFin")
    List<Donacion> findByFechaDonacionBetween(@Param("fechaInicio") LocalDateTime fechaInicio, 
                                            @Param("fechaFin") LocalDateTime fechaFin);
    
    @Query("SELECT COUNT(d) FROM Donacion d WHERE d.estado = :estado")
    Long countByEstado(@Param("estado") String estado);
    
    @Query("SELECT d FROM Donacion d WHERE d.estado = :estado ORDER BY d.fechaDonacion DESC")
    List<Donacion> findByEstadoOrderByFechaDonacionDesc(@Param("estado") String estado);
}
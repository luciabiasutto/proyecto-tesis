package com.donaciones.donacionesbackend.repository;

import com.donaciones.donacionesbackend.entity.Donacion;
import com.donaciones.donacionesbackend.entity.EstadoDonacion;
import com.donaciones.donacionesbackend.entity.PuntoDonacion;
import com.donaciones.donacionesbackend.entity.TipoDonacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DonacionRepository extends JpaRepository<Donacion, Long> {
    
    // Buscar donaciones por punto de donación
    List<Donacion> findByPuntoDonacion(PuntoDonacion puntoDonacion);
    
    // Buscar donaciones por estado
    List<Donacion> findByEstado(EstadoDonacion estado);
    
    // Buscar donaciones por tipo
    List<Donacion> findByTipoDonacion(TipoDonacion tipoDonacion);
    
    // Buscar donaciones por donante
    List<Donacion> findByDonanteNombreContainingIgnoreCase(String nombreDonante);
    
    // Buscar donaciones por rango de fechas
    List<Donacion> findByFechaDonacionBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    // Buscar donaciones por punto y estado
    List<Donacion> findByPuntoDonacionAndEstado(PuntoDonacion puntoDonacion, EstadoDonacion estado);
    
    // Contar donaciones por estado
    @Query("SELECT COUNT(d) FROM Donacion d WHERE d.estado = :estado")
    Long countByEstado(@Param("estado") EstadoDonacion estado);
    
    // Obtener trazabilidad de una donación específica
    @Query("SELECT d FROM Donacion d WHERE d.id = :id ORDER BY d.fechaDonacion")
    List<Donacion> findTrazabilidadById(@Param("id") Long id);
}

package com.donaciones.donacionesbackend.repository;

import com.donaciones.donacionesbackend.entity.Donacion;
import com.donaciones.donacionesbackend.entity.EstadoDonacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DonacionRepository extends JpaRepository<Donacion, Long> {
    
    List<Donacion> findByEstado(String estado);
    
    List<Donacion> findByPuntoDonacionId(Long puntoDonacionId);
    
    List<Donacion> findByTipoDonacion(String tipoDonacion);
    
    List<Donacion> findByBeneficiarioId(Long beneficiarioId);
    
    List<Donacion> findByDonanteId(Long donanteId);
    
    @Query("SELECT d FROM Donacion d WHERE d.fechaDonacion BETWEEN :fechaInicio AND :fechaFin")
    List<Donacion> findByFechaDonacionBetween(@Param("fechaInicio") LocalDateTime fechaInicio, 
                                            @Param("fechaFin") LocalDateTime fechaFin);
    
    @Query("SELECT COUNT(d) FROM Donacion d WHERE d.estado = :estado")
    Long countByEstado(@Param("estado") String estado);
    
    @Query("SELECT d FROM Donacion d WHERE d.estado = :estado ORDER BY d.fechaDonacion DESC")
    List<Donacion> findByEstadoOrderByFechaDonacionDesc(@Param("estado") String estado);
}
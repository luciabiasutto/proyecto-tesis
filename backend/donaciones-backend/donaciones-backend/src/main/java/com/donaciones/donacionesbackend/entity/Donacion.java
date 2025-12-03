package com.donaciones.donacionesbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donaciones")
public class Donacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "punto_donacion_id", nullable = false)
    private Long puntoDonacionId;
    
    @Column(name = "donante_id")
    private Long donanteId;
    
    @Column(nullable = false)
    private String tipoDonacion;
    
    @Column(nullable = false)
    private Integer cantidad;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(nullable = false)
    private String estado; // PENDIENTE, VERIFICADA, RECHAZADA, RECIBIDA, CLASIFICADA, DISTRIBUIDA, ENTREGADA
    
    @Column(name = "fecha_donacion")
    private LocalDateTime fechaDonacion;
    
    @Column(name = "beneficiario_id")
    private Long beneficiarioId;
    
    @Column(name = "fecha_entrega")
    private LocalDateTime fechaEntrega;
    
    @Column(columnDefinition = "TEXT")
    private String observaciones;
    
    // Constructores
    public Donacion() {}
    
    public Donacion(Long puntoDonacionId, String tipoDonacion, Integer cantidad, 
                   String descripcion, String estado) {
        this.puntoDonacionId = puntoDonacionId;
        this.tipoDonacion = tipoDonacion;
        this.cantidad = cantidad;
        this.descripcion = descripcion;
        this.estado = estado;
        this.fechaDonacion = LocalDateTime.now();
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getPuntoDonacionId() { return puntoDonacionId; }
    public void setPuntoDonacionId(Long puntoDonacionId) { this.puntoDonacionId = puntoDonacionId; }
    
    public Long getDonanteId() { return donanteId; }
    public void setDonanteId(Long donanteId) { this.donanteId = donanteId; }
    
    public String getTipoDonacion() { return tipoDonacion; }
    public void setTipoDonacion(String tipoDonacion) { this.tipoDonacion = tipoDonacion; }
    
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public LocalDateTime getFechaDonacion() { return fechaDonacion; }
    public void setFechaDonacion(LocalDateTime fechaDonacion) { this.fechaDonacion = fechaDonacion; }
    
    public Long getBeneficiarioId() { return beneficiarioId; }
    public void setBeneficiarioId(Long beneficiarioId) { this.beneficiarioId = beneficiarioId; }
    
    public LocalDateTime getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDateTime fechaEntrega) { this.fechaEntrega = fechaEntrega; }
    
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
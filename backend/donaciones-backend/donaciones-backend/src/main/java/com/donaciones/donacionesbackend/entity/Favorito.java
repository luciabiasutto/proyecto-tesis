package com.donaciones.donacionesbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "favoritos")
public class Favorito {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;
    
    @Column(name = "punto_donacion_id", nullable = false)
    private Long puntoDonacionId;
    
    @Column(name = "etiqueta", length = 100)
    private String etiqueta;
    
    @Column(name = "fecha_agregado", nullable = false)
    private LocalDateTime fechaAgregado;
    
    @Column(name = "fecha_agendada")
    private LocalDateTime fechaAgendada;
    
    // Relación Many-to-One con PuntoDonacion (sin crear foreign key para evitar problemas)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "punto_donacion_id", insertable = false, updatable = false)
    private PuntoDonacion puntoDonacion;
    
    // Constructor vacío
    public Favorito() {
        this.fechaAgregado = LocalDateTime.now();
    }
    
    // Constructor con parámetros
    public Favorito(Long usuarioId, Long puntoDonacionId) {
        this.usuarioId = usuarioId;
        this.puntoDonacionId = puntoDonacionId;
        this.fechaAgregado = LocalDateTime.now();
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUsuarioId() {
        return usuarioId;
    }
    
    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }
    
    public Long getPuntoDonacionId() {
        return puntoDonacionId;
    }
    
    public void setPuntoDonacionId(Long puntoDonacionId) {
        this.puntoDonacionId = puntoDonacionId;
    }
    
    public String getEtiqueta() {
        return etiqueta;
    }
    
    public void setEtiqueta(String etiqueta) {
        this.etiqueta = etiqueta;
    }
    
    public LocalDateTime getFechaAgregado() {
        return fechaAgregado;
    }
    
    public void setFechaAgregado(LocalDateTime fechaAgregado) {
        this.fechaAgregado = fechaAgregado;
    }
    
    public LocalDateTime getFechaAgendada() {
        return fechaAgendada;
    }
    
    public void setFechaAgendada(LocalDateTime fechaAgendada) {
        this.fechaAgendada = fechaAgendada;
    }
    
    public PuntoDonacion getPuntoDonacion() {
        return puntoDonacion;
    }
    
    public void setPuntoDonacion(PuntoDonacion puntoDonacion) {
        this.puntoDonacion = puntoDonacion;
    }
}







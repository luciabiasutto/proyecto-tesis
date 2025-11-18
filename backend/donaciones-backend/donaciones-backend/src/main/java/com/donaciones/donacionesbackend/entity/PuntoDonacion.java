package com.donaciones.donacionesbackend.entity;

import jakarta.persistence.*;
import java.time.LocalTime;
import java.time.LocalDateTime;

/**
 * Entidad que representa un punto de donación en el sistema
 * Almacena toda la información de un lugar donde se pueden realizar donaciones
 */
@Entity
@Table(name = "puntos_donacion")
public class PuntoDonacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre; // Nombre del punto (ej: "Centro de Donaciones Centro")
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String direccion; // Dirección completa del punto
    
    @Column(nullable = false)
    private Double latitud; // Coordenada latitud para el mapa
    
    @Column(nullable = false)
    private Double longitud; // Coordenada longitud para el mapa
    
    @Column(nullable = false)
    private String tipoDonacion; // JSON string con los tipos de donación aceptados
    
    @Column(name = "horario_apertura")
    private LocalTime horarioApertura; // Hora de apertura (opcional)
    
    @Column(name = "horario_cierre")
    private LocalTime horarioCierre; // Hora de cierre (opcional)
    
    private String telefono; // Teléfono de contacto (opcional)
    private String email; // Email de contacto (opcional)
    
    // Campos legacy - no los uso en la versión actual pero los mantengo por compatibilidad
    @Column(nullable = true)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private Rol rol;
    
    /**
     * Indica si el punto está activo o desactivado
     * Los puntos desactivados no aparecen en el mapa público pero siguen en la BD
     */
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
    
    /**
     * Estado del punto en el flujo de aprobación
     * PENDIENTE: esperando aprobación del admin (cuando lo crea una organización)
     * ACTIVO: aprobado y visible en el mapa
     * RECHAZADO: rechazado por el admin
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPunto estado = EstadoPunto.ACTIVO;
    
    /**
     * ID del usuario que creó el punto
     * Si es null, fue creado por un administrador
     * Si tiene valor, fue creado por una organización
     */
    @Column(name = "usuario_creador_id")
    private Long usuarioCreadorId;
    
    /**
     * Tipo de usuario que creó el punto
     * ORGANIZACION: creado por una organización (necesita aprobación)
     * ADMINISTRADOR: creado por un admin (activo directamente)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_creador")
    private Rol tipoCreador;
    
    /**
     * Motivo por el cual el punto fue rechazado
     * Solo se llena cuando estado = RECHAZADO
     */
    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    
    // Constructores
    public PuntoDonacion() {}
    
    public PuntoDonacion(String nombre, String direccion, Double latitud, Double longitud, 
                        String tipoDonacion, LocalTime horarioApertura, 
                        LocalTime horarioCierre, String telefono, String email, String password) {
        this.nombre = nombre;
        this.direccion = direccion;
        this.latitud = latitud;
        this.longitud = longitud;
        this.tipoDonacion = tipoDonacion;
        this.horarioApertura = horarioApertura;
        this.horarioCierre = horarioCierre;
        this.telefono = telefono;
        this.email = email;
        this.password = password;
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    
    public Double getLatitud() { return latitud; }
    public void setLatitud(Double latitud) { this.latitud = latitud; }
    
    public Double getLongitud() { return longitud; }
    public void setLongitud(Double longitud) { this.longitud = longitud; }
    
    public String getTipoDonacion() { return tipoDonacion; }
    public void setTipoDonacion(String tipoDonacion) { this.tipoDonacion = tipoDonacion; }
    
    public LocalTime getHorarioApertura() { return horarioApertura; }
    public void setHorarioApertura(LocalTime horarioApertura) { this.horarioApertura = horarioApertura; }
    
    public LocalTime getHorarioCierre() { return horarioCierre; }
    public void setHorarioCierre(LocalTime horarioCierre) { this.horarioCierre = horarioCierre; }
    
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Rol getRol() { return rol; }
    public void setRol(Rol rol) { this.rol = rol; }
    
    public EstadoPunto getEstado() { return estado; }
    public void setEstado(EstadoPunto estado) { this.estado = estado; }
    
    public Long getUsuarioCreadorId() { return usuarioCreadorId; }
    public void setUsuarioCreadorId(Long usuarioCreadorId) { this.usuarioCreadorId = usuarioCreadorId; }
    
    public Rol getTipoCreador() { return tipoCreador; }
    public void setTipoCreador(Rol tipoCreador) { this.tipoCreador = tipoCreador; }
    
    public String getMotivoRechazo() { return motivoRechazo; }
    public void setMotivoRechazo(String motivoRechazo) { this.motivoRechazo = motivoRechazo; }
}

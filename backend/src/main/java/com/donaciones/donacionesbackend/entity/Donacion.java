package com.donaciones.donacionesbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donaciones")
public class Donacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "punto_donacion_id")
    private PuntoDonacion puntoDonacion;
    
    @Column(name = "donante_nombre", nullable = false)
    private String donanteNombre;
    
    @Column(name = "donante_email")
    private String donanteEmail;
    
    @Column(name = "donante_telefono")
    private String donanteTelefono;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_donacion", nullable = false)
    private TipoDonacion tipoDonacion;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(nullable = false)
    private Integer cantidad = 1;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoDonacion estado = EstadoDonacion.RECIBIDA;
    
    @Column(name = "fecha_donacion")
    private LocalDateTime fechaDonacion = LocalDateTime.now();
    
    @Column(name = "fecha_entrega")
    private LocalDateTime fechaEntrega;
    
    @Column(name = "beneficiario_nombre")
    private String beneficiarioNombre;
    
    @Column(name = "beneficiario_contacto")
    private String beneficiarioContacto;
    
    // Constructores
    public Donacion() {}
    
    public Donacion(PuntoDonacion puntoDonacion, String donanteNombre, String donanteEmail,
                   String donanteTelefono, TipoDonacion tipoDonacion, String descripcion,
                   Integer cantidad) {
        this.puntoDonacion = puntoDonacion;
        this.donanteNombre = donanteNombre;
        this.donanteEmail = donanteEmail;
        this.donanteTelefono = donanteTelefono;
        this.tipoDonacion = tipoDonacion;
        this.descripcion = descripcion;
        this.cantidad = cantidad;
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public PuntoDonacion getPuntoDonacion() { return puntoDonacion; }
    public void setPuntoDonacion(PuntoDonacion puntoDonacion) { this.puntoDonacion = puntoDonacion; }
    
    public String getDonanteNombre() { return donanteNombre; }
    public void setDonanteNombre(String donanteNombre) { this.donanteNombre = donanteNombre; }
    
    public String getDonanteEmail() { return donanteEmail; }
    public void setDonanteEmail(String donanteEmail) { this.donanteEmail = donanteEmail; }
    
    public String getDonanteTelefono() { return donanteTelefono; }
    public void setDonanteTelefono(String donanteTelefono) { this.donanteTelefono = donanteTelefono; }
    
    public TipoDonacion getTipoDonacion() { return tipoDonacion; }
    public void setTipoDonacion(TipoDonacion tipoDonacion) { this.tipoDonacion = tipoDonacion; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    
    public EstadoDonacion getEstado() { return estado; }
    public void setEstado(EstadoDonacion estado) { this.estado = estado; }
    
    public LocalDateTime getFechaDonacion() { return fechaDonacion; }
    public void setFechaDonacion(LocalDateTime fechaDonacion) { this.fechaDonacion = fechaDonacion; }
    
    public LocalDateTime getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDateTime fechaEntrega) { this.fechaEntrega = fechaEntrega; }
    
    public String getBeneficiarioNombre() { return beneficiarioNombre; }
    public void setBeneficiarioNombre(String beneficiarioNombre) { this.beneficiarioNombre = beneficiarioNombre; }
    
    public String getBeneficiarioContacto() { return beneficiarioContacto; }
    public void setBeneficiarioContacto(String beneficiarioContacto) { this.beneficiarioContacto = beneficiarioContacto; }
}

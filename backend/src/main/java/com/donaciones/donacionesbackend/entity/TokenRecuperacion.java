package com.donaciones.donacionesbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

//Token temporal para recuperar contraseña olvidada.
@Entity
@Table(name = "tokens_recuperacion")
public class TokenRecuperacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Código único que va en el link del correo de recuperación 
    @Column(nullable = false, unique = true)
    private String token;
    
    @Column(nullable = false)
    private String email;
    
    // Indica en qué tabla buscar al usuario
    @Column(nullable = false)
    private String rol; // DONANTE, ADMINISTRADOR, ORGANIZACION
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(nullable = false)
    private LocalDateTime fechaExpiracion;
    
    // Evita reutilizar el mismo link después de cambiar la contraseña 
    @Column(nullable = false)
    private Boolean usado = false;
    
    // Constructores
    public TokenRecuperacion() {
        this.fechaCreacion = LocalDateTime.now();
    }
    
    public TokenRecuperacion(String token, String email, String rol) {
        this.token = token;
        this.email = email;
        this.rol = rol;
        this.fechaCreacion = LocalDateTime.now();
        this.fechaExpiracion = LocalDateTime.now().plusHours(1); // Token válido por 1 hora
        this.usado = false;
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    public LocalDateTime getFechaExpiracion() { return fechaExpiracion; }
    public void setFechaExpiracion(LocalDateTime fechaExpiracion) { this.fechaExpiracion = fechaExpiracion; }
    
    public Boolean getUsado() { return usado; }
    public void setUsado(Boolean usado) { this.usado = usado; }
    
    // Comprueba si ya pasó la hora de validez del token  
    public boolean estaExpirado() {
        return LocalDateTime.now().isAfter(fechaExpiracion);
    }
    
    // Token usable solo si no expiró y no fue consumido antes 
    public boolean esValido() {
        return !usado && !estaExpirado();
    }
}



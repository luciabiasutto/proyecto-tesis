package com.donaciones.donacionesbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;


//Representa a un administrador del sistema.
//Los admins gestionan puntos, donaciones y usuarios por eso tienen su propia tabla
@Entity
@Table(name = "administradores")
public class Administrador {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(nullable = false)
    private String apellido;
    
    //Email único: lo uso como usuario para el login unificado.
    @Column(nullable = false, unique = true)
    private String email;
    
    /** Contraseña hasheada con BCrypt; nunca se guarda en texto plano al registrarse. */
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = true)
    private String telefono;
    
    //Siempre ADMINISTRADOR; lo guardo para distinguir roles en el auth unificado
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol = Rol.ADMINISTRADOR;
    
    // Permite desactivar una cuenta sin borrarla del historial
    @Column(nullable = false)
    private Boolean activo = true;
    
    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro = LocalDateTime.now();
    
    // Constructores
    public Administrador() {}
    
    public Administrador(String nombre, String apellido, String email, String password, String telefono) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.password = password;
        this.telefono = telefono;
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    
    public Rol getRol() { return rol; }
    public void setRol(Rol rol) { this.rol = rol; }
    
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}


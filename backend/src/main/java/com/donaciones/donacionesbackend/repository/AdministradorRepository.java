package com.donaciones.donacionesbackend.repository;

import com.donaciones.donacionesbackend.entity.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * acceso a datos de administradores
 * spring Data genera las consultas a partir de los nombres de los métodos
 */
@Repository
public interface AdministradorRepository extends JpaRepository<Administrador, Long> {

    /** lo uso en el login para buscar por email */
    Optional<Administrador> findByEmail(String email);

    /** lista solo cuentas activas para el panel de gestión */
    List<Administrador> findByActivoTrue();

    /** búsqueda por nombre o apellido sin distinguir mayúsculas */
    List<Administrador> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(String nombre, String apellido);
}

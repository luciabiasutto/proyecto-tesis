package com.donaciones.donacionesbackend.repository;

import com.donaciones.donacionesbackend.entity.Organizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Acceso a organizaciones que gestionan puntos de donación.
 */
@Repository
public interface OrganizacionRepository extends JpaRepository<Organizacion, Long> {

    /** Login y validación de email único al registrarse. */
    Optional<Organizacion> findByEmail(String email);
}






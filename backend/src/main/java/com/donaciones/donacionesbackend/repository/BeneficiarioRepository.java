package com.donaciones.donacionesbackend.repository;

import com.donaciones.donacionesbackend.entity.Beneficiario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio de beneficiarios.
 * Centraliza las consultas que necesito para registro, login y asignación de donaciones.
 */
@Repository
public interface BeneficiarioRepository extends JpaRepository<Beneficiario, Long> {

    Optional<Beneficiario> findByEmail(String email);

    List<Beneficiario> findByActivoTrue();

    List<Beneficiario> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(String nombre, String apellido);

    /** Evito duplicar beneficiarios con el mismo documento. */
    Optional<Beneficiario> findByDocumento(String documento);
}
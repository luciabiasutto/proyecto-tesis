package com.donaciones.donacionesbackend.repository;

import com.donaciones.donacionesbackend.entity.Beneficiario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BeneficiarioRepository extends JpaRepository<Beneficiario, Long> {
    Optional<Beneficiario> findByEmail(String email);
    List<Beneficiario> findByActivoTrue();
    List<Beneficiario> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(String nombre, String apellido);
    Optional<Beneficiario> findByDocumento(String documento);
}
package com.donaciones.donacionesbackend.repository;

import com.donaciones.donacionesbackend.entity.Donante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonanteRepository extends JpaRepository<Donante, Long> {
    Optional<Donante> findByEmail(String email);
    List<Donante> findByActivoTrue();
    List<Donante> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(String nombre, String apellido);
}


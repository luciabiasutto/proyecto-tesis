package com.donaciones.donacionesbackend.repository;

import com.donaciones.donacionesbackend.entity.TokenRecuperacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenRecuperacionRepository extends JpaRepository<TokenRecuperacion, Long> {
    Optional<TokenRecuperacion> findByToken(String token);
    Optional<TokenRecuperacion> findByEmailAndRol(String email, String rol);
}




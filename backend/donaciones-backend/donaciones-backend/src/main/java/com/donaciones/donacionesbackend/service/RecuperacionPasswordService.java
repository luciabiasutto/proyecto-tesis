package com.donaciones.donacionesbackend.service;

import com.donaciones.donacionesbackend.entity.*;
import com.donaciones.donacionesbackend.entity.TokenRecuperacion;
import com.donaciones.donacionesbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;

@Service
public class RecuperacionPasswordService {
    
    @Autowired
    private DonanteRepository donanteRepository;
    
    @Autowired
    private AdministradorRepository administradorRepository;
    
    @Autowired
    private OrganizacionRepository organizacionRepository;
    
    @Autowired
    private TokenRecuperacionRepository tokenRecuperacionRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;
    
    public boolean solicitarRecuperacion(String email, String rol) {
        try {
            // Verificar que el usuario existe
            boolean usuarioExiste = false;
            
            switch (rol.toUpperCase()) {
                case "DONANTE":
                    usuarioExiste = donanteRepository.findByEmail(email).isPresent();
                    break;
                case "ADMINISTRADOR":
                    usuarioExiste = administradorRepository.findByEmail(email).isPresent();
                    break;
                case "ORGANIZACION":
                    usuarioExiste = organizacionRepository.findByEmail(email).isPresent();
                    break;
            }
            
            if (!usuarioExiste) {
                // Por seguridad, no revelamos si el email existe o no
                return true; // Devolvemos true para no revelar información
            }
            
            // Invalidar tokens anteriores para este email y rol
            Optional<TokenRecuperacion> tokenAnterior = tokenRecuperacionRepository.findByEmailAndRol(email, rol.toUpperCase());
            if (tokenAnterior.isPresent()) {
                TokenRecuperacion token = tokenAnterior.get();
                token.setUsado(true);
                tokenRecuperacionRepository.save(token);
            }
            
            // Generar nuevo token
            String token = generarToken();
            TokenRecuperacion tokenRecuperacion = new TokenRecuperacion(token, email, rol.toUpperCase());
            tokenRecuperacionRepository.save(tokenRecuperacion);
            
            // Intentar enviar email (si falla, el token ya está guardado y se puede usar)
            boolean emailEnviado = emailService.enviarEmailRecuperacion(email, token, rol.toUpperCase());
            
            if (!emailEnviado) {
                System.out.println("El token se generó pero el email no se pudo enviar. Token: " + token);
            }
            
            return true;
        } catch (Exception e) {
            System.err.println("Error al solicitar recuperación: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    public boolean resetearPassword(String token, String nuevaPassword) {
        try {
            Optional<TokenRecuperacion> tokenOpt = tokenRecuperacionRepository.findByToken(token);
            
            if (tokenOpt.isEmpty()) {
                return false;
            }
            
            TokenRecuperacion tokenRecuperacion = tokenOpt.get();
            
            if (!tokenRecuperacion.esValido()) {
                return false;
            }
            
            // Actualizar contraseña según el rol
            boolean actualizado = false;
            switch (tokenRecuperacion.getRol().toUpperCase()) {
                case "DONANTE":
                    Optional<Donante> donante = donanteRepository.findByEmail(tokenRecuperacion.getEmail());
                    if (donante.isPresent()) {
                        donante.get().setPassword(nuevaPassword);
                        donanteRepository.save(donante.get());
                        actualizado = true;
                    }
                    break;
                case "ADMINISTRADOR":
                    Optional<Administrador> admin = administradorRepository.findByEmail(tokenRecuperacion.getEmail());
                    if (admin.isPresent()) {
                        admin.get().setPassword(nuevaPassword);
                        administradorRepository.save(admin.get());
                        actualizado = true;
                    }
                    break;
                case "ORGANIZACION":
                    Optional<Organizacion> org = organizacionRepository.findByEmail(tokenRecuperacion.getEmail());
                    if (org.isPresent()) {
                        org.get().setPassword(nuevaPassword);
                        organizacionRepository.save(org.get());
                        actualizado = true;
                    }
                    break;
            }
            
            if (actualizado) {
                // Marcar token como usado
                tokenRecuperacion.setUsado(true);
                tokenRecuperacionRepository.save(tokenRecuperacion);
                return true;
            }
            
            return false;
        } catch (Exception e) {
            System.err.println("Error al resetear contraseña: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    private String generarToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}


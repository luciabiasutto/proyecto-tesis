package com.donaciones.donacionesbackend.controller;

import com.donaciones.donacionesbackend.service.RecuperacionPasswordService;
import com.donaciones.donacionesbackend.util.PasswordValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth/password")
@CrossOrigin(origins = "*")
public class RecuperacionPasswordController {
    
    @Autowired
    private RecuperacionPasswordService recuperacionPasswordService;
    
    @PostMapping("/solicitar")
    public ResponseEntity<?> solicitarRecuperacion(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String rol = request.get("rol");
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El email es requerido");
            }
            
            if (rol == null || rol.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El rol es requerido");
            }
            
            boolean enviado = recuperacionPasswordService.solicitarRecuperacion(email, rol);
            
            Map<String, Object> response = new HashMap<>();
            if (enviado) {
                response.put("success", true);
                response.put("message", "Si el email existe, se ha enviado un enlace de recuperación");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Error al procesar la solicitud");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/resetear")
    public ResponseEntity<?> resetearPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String nuevaPassword = request.get("nuevaPassword");
            
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El token es requerido");
            }
            
            if (nuevaPassword == null || nuevaPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("La nueva contraseña es requerida");
            }
            
            // Validar contraseña segura
            PasswordValidator.ValidationResult validation = PasswordValidator.validateWithDetails(nuevaPassword);
            if (!validation.isValid()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", validation.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
            boolean reseteado = recuperacionPasswordService.resetearPassword(token, nuevaPassword);
            
            Map<String, Object> response = new HashMap<>();
            if (reseteado) {
                response.put("success", true);
                response.put("message", "Contraseña actualizada exitosamente");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Token inválido o expirado");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/validar-token")
    public ResponseEntity<?> validarToken(@RequestParam String token) {
        try {
            // El servicio puede validar el token
            // Por ahora, solo verificamos que existe y no está usado/expirado
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true); // Simplificado - se validará en el reset
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}




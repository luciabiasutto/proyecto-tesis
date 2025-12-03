package com.donaciones.donacionesbackend.controller;

import com.donaciones.donacionesbackend.entity.*;
import com.donaciones.donacionesbackend.repository.*;
import com.donaciones.donacionesbackend.util.PasswordValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controlador unificado para autenticación y registro
 * Maneja login y registro para los tres tipos de usuarios: Donante, Administrador y Organización
 * Decidí unificar todo en un solo controlador para simplificar el código
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthUnificadoController {

    @Autowired
    private DonanteRepository donanteRepository;

    @Autowired
    private BeneficiarioRepository beneficiarioRepository;

    @Autowired
    private PuntoDonacionRepository puntoDonacionRepository;

    @Autowired
    private AdministradorRepository administradorRepository;

    @Autowired
    private OrganizacionRepository organizacionRepository;

    /**
     * Endpoint de login unificado
     * Recibe email, password y rol, y busca el usuario correspondiente en la tabla adecuada
     * Nota: En producción debería usar hash de contraseñas, pero para la tesis uso comparación directa
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        try {
            String email = loginData.get("email");
            String password = loginData.get("password");
            String rol = loginData.get("rol");

            // Valido que vengan todos los campos requeridos
            if (email == null || password == null || rol == null) {
                return ResponseEntity.badRequest().body("Email, contraseña y rol son requeridos");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);

            // Busco el usuario según su rol en la tabla correspondiente
            switch (rol.toUpperCase()) {
                case "DONANTE":
                    Optional<Donante> donante = donanteRepository.findByEmail(email);
                    // Comparo la contraseña directamente (en producción usaría BCrypt)
                    if (donante.isPresent() && donante.get().getPassword().equals(password)) {
                        response.put("success", true);
                        response.put("usuario", donante.get());
                        response.put("rol", "DONANTE");
                    }
                    break;


                case "ADMINISTRADOR":
                    Optional<Administrador> admin = administradorRepository.findByEmail(email);
                    if (admin.isPresent() && admin.get().getPassword().equals(password)) {
                        response.put("success", true);
                        response.put("usuario", admin.get());
                        response.put("rol", "ADMINISTRADOR");
                    }
                    break;

                case "ORGANIZACION":
                    Optional<Organizacion> organizacion = organizacionRepository.findByEmail(email);
                    if (organizacion.isPresent() && organizacion.get().getPassword().equals(password)) {
                        response.put("success", true);
                        response.put("usuario", organizacion.get());
                        response.put("rol", "ORGANIZACION");
                    }
                    break;

                default:
                    return ResponseEntity.badRequest().body("Rol inválido");
            }

            if ((Boolean) response.get("success")) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("Credenciales incorrectas");
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al iniciar sesión: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> registerData) {
        try {
            // Debug: imprimir todos los datos recibidos
            System.out.println("=== DEBUG REGISTRO BACKEND ===");
            System.out.println("Datos recibidos: " + registerData);
            System.out.println("Keys en registerData: " + registerData.keySet());
            System.out.println("Valor de 'rol': " + registerData.get("rol"));
            System.out.println("Tipo de 'rol': " + (registerData.get("rol") != null ? registerData.get("rol").getClass().getName() : "null"));
            
            String rol = (String) registerData.get("rol");
            System.out.println("Rol después de cast: " + rol);
            
            if (rol == null || rol.trim().isEmpty()) {
                System.out.println("ERROR: Rol es null o vacío");
                System.out.println("Todos los campos recibidos: " + registerData);
                return ResponseEntity.badRequest().body("Rol es requerido. Campos recibidos: " + registerData.keySet());
            }

            // Limpiar y normalizar el rol
            rol = rol.trim().toUpperCase();
            System.out.println("Rol normalizado: " + rol);
            
            // Validar contraseña segura
            String password = (String) registerData.get("password");
            if (password != null) {
                PasswordValidator.ValidationResult passwordValidation = PasswordValidator.validateWithDetails(password);
                if (!passwordValidation.isValid()) {
                    return ResponseEntity.badRequest().body(passwordValidation.getMessage());
                }
            } else {
                return ResponseEntity.badRequest().body("La contraseña es requerida");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);

            // Creo el usuario según el rol especificado
            // Cada tipo de usuario tiene campos diferentes, por eso los manejo por separado
            if ("DONANTE".equals(rol)) {
                Donante donante = new Donante();
                donante.setNombre((String) registerData.get("nombre"));
                donante.setApellido((String) registerData.get("apellido")); // Los donantes tienen apellido
                donante.setEmail((String) registerData.get("email"));
                donante.setPassword((String) registerData.get("password"));
                donante.setFechaRegistro(LocalDateTime.now());

                // Verifico que el email no esté ya registrado
                if (donanteRepository.findByEmail(donante.getEmail()).isPresent()) {
                    return ResponseEntity.badRequest().body("El email ya está registrado");
                }

                Donante savedDonante = donanteRepository.save(donante);
                response.put("success", true);
                response.put("usuario", savedDonante);
                response.put("rol", "DONANTE");
                
            } else if ("ADMINISTRADOR".equals(rol)) {
                Administrador admin = new Administrador();
                admin.setNombre((String) registerData.get("nombre"));
                admin.setApellido((String) registerData.get("apellido")); // Los admins también tienen apellido
                admin.setEmail((String) registerData.get("email"));
                admin.setPassword((String) registerData.get("password"));
                admin.setFechaRegistro(LocalDateTime.now());

                if (administradorRepository.findByEmail(admin.getEmail()).isPresent()) {
                    return ResponseEntity.badRequest().body("El email ya está registrado");
                }

                Administrador savedAdmin = administradorRepository.save(admin);
                response.put("success", true);
                response.put("usuario", savedAdmin);
                response.put("rol", "ADMINISTRADOR");
                
            } else if ("ORGANIZACION".equals(rol)) {
                Organizacion organizacion = new Organizacion();
                organizacion.setNombre((String) registerData.get("nombre"));
                // Las organizaciones NO tienen apellido, solo nombre
                organizacion.setEmail((String) registerData.get("email"));
                organizacion.setPassword((String) registerData.get("password"));
                organizacion.setFechaRegistro(LocalDateTime.now());

                if (organizacionRepository.findByEmail(organizacion.getEmail()).isPresent()) {
                    return ResponseEntity.badRequest().body("El email ya está registrado");
                }

                Organizacion savedOrganizacion = organizacionRepository.save(organizacion);
                response.put("success", true);
                response.put("usuario", savedOrganizacion);
                response.put("rol", "ORGANIZACION");
                
            } else {
                return ResponseEntity.badRequest().body("Rol inválido: '" + rol + "'. Roles válidos: DONANTE, ADMINISTRADOR, ORGANIZACION");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al registrar: " + e.getMessage());
        }
    }
}


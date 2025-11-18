package com.donaciones.donacionesbackend.controller;

import com.donaciones.donacionesbackend.entity.PuntoDonacion;
import com.donaciones.donacionesbackend.entity.TipoDonacion;
import com.donaciones.donacionesbackend.entity.EstadoPunto;
import com.donaciones.donacionesbackend.entity.Rol;
import com.donaciones.donacionesbackend.repository.PuntoDonacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

/**
 * Controlador REST para gestionar los puntos de donación
 * Maneja todas las operaciones CRUD y la lógica de negocio relacionada
 */
@RestController
@RequestMapping("/puntos-donacion")
@CrossOrigin(origins = "*") // Permito CORS para que el frontend pueda hacer peticiones
public class PuntoDonacionController {
    
    @Autowired
    private PuntoDonacionRepository puntoDonacionRepository;
    
    /**
     * Endpoint para obtener todos los puntos sin filtrar
     * Lo uso en el panel de administración para ver todos los puntos, incluso los desactivados
     */
    @GetMapping("/todos")
    public ResponseEntity<List<PuntoDonacion>> getAllPuntos() {
        try {
            List<PuntoDonacion> puntos = puntoDonacionRepository.findAll();
            return ResponseEntity.ok(puntos);
        } catch (Exception e) {
            System.err.println("Error en getAllPuntos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Endpoint principal para obtener puntos de donación
     * Si viene el parámetro "todos=true", devuelve todos los puntos (para admin)
     * Si no, solo devuelve los activos y aprobados (para el mapa público)
     * Esto me permite reutilizar el mismo endpoint para ambos casos
     */
    @GetMapping
    public ResponseEntity<List<PuntoDonacion>> getAllPuntosActivos(@RequestParam(required = false) String todos) {
        try {
            // Verifico si se está solicitando todos los puntos
            // Acepto tanto "true" como "1" para mayor flexibilidad
            boolean solicitarTodos = todos != null && (todos.equalsIgnoreCase("true") || todos.equals("1"));
            
            if (solicitarTodos) {
                // Para administradores: devuelvo todos los puntos
                List<PuntoDonacion> puntos = puntoDonacionRepository.findAll();
                return ResponseEntity.ok(puntos);
            } else {
                // Para el mapa público: solo puntos activos y aprobados
                List<PuntoDonacion> puntos = puntoDonacionRepository.findByActivoTrueAndEstado(EstadoPunto.ACTIVO);
                return ResponseEntity.ok(puntos);
            }
        } catch (Exception e) {
            System.err.println("Error en getAllPuntosActivos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Obtiene todos los puntos que están pendientes de aprobación
     * Los uso en la pantalla de "Aprobar Puntos" del administrador
     */
    @GetMapping("/pendientes")
    public ResponseEntity<List<PuntoDonacion>> getPuntosPendientes() {
        try {
            List<PuntoDonacion> puntos = puntoDonacionRepository.findByEstado(EstadoPunto.PENDIENTE);
            return ResponseEntity.ok(puntos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Obtiene todos los puntos creados por una organización específica
     * Lo uso en "Mis Puntos" para que cada organización vea solo sus puntos
     */
    @GetMapping("/organizacion/{organizacionId}")
    public ResponseEntity<List<PuntoDonacion>> getPuntosPorOrganizacion(@PathVariable Long organizacionId) {
        try {
            List<PuntoDonacion> puntos = puntoDonacionRepository.findByUsuarioCreadorIdAndTipoCreador(
                organizacionId, Rol.ORGANIZACION);
            return ResponseEntity.ok(puntos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    // Obtener un punto de donación por ID
    @GetMapping("/{id}")
    public ResponseEntity<PuntoDonacion> getPuntoById(@PathVariable Long id) {
        Optional<PuntoDonacion> punto = puntoDonacionRepository.findById(id);
        return punto.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    // Buscar puntos por tipo de donación
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<PuntoDonacion>> getPuntosByTipo(@PathVariable TipoDonacion tipo) {
        List<PuntoDonacion> puntos = puntoDonacionRepository.findByTipoDonacionAndActivoTrue(tipo);
        return ResponseEntity.ok(puntos);
    }
    
    // Buscar puntos cercanos
    @GetMapping("/cercanos")
    public ResponseEntity<List<PuntoDonacion>> getPuntosCercanos(
            @RequestParam Double latitud,
            @RequestParam Double longitud,
            @RequestParam(defaultValue = "10") Double radioKm) {
        List<PuntoDonacion> puntos = puntoDonacionRepository.findPuntosCercanos(latitud, longitud, radioKm);
        return ResponseEntity.ok(puntos);
    }
    
    // Buscar puntos por nombre
    @GetMapping("/buscar")
    public ResponseEntity<List<PuntoDonacion>> buscarPuntos(@RequestParam String nombre) {
        List<PuntoDonacion> puntos = puntoDonacionRepository.findByNombreContainingIgnoreCaseAndActivoTrue(nombre);
        return ResponseEntity.ok(puntos);
    }
    
    // Manejar preflight requests
    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Max-Age", "3600");
        return ResponseEntity.ok().build();
    }

    /**
     * Crea un nuevo punto de donación
     * La lógica cambia según quién lo crea:
     * - Si es una organización: el punto queda PENDIENTE hasta que un admin lo apruebe
     * - Si es un administrador: el punto queda ACTIVO directamente
     */
    @PostMapping
    public ResponseEntity<PuntoDonacion> crearPunto(@RequestBody Map<String, Object> puntoData, HttpServletResponse response) {
        // Configuro headers CORS manualmente porque a veces el @CrossOrigin no funciona bien
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        
        try {
            PuntoDonacion punto = new PuntoDonacion();
            // Mapeo todos los campos del JSON al objeto
            punto.setNombre((String) puntoData.get("nombre"));
            punto.setDireccion((String) puntoData.get("direccion"));
            punto.setLatitud(((Number) puntoData.get("latitud")).doubleValue());
            punto.setLongitud(((Number) puntoData.get("longitud")).doubleValue());
            punto.setTipoDonacion((String) puntoData.get("tipoDonacion"));
            punto.setTelefono((String) puntoData.get("telefono"));
            punto.setEmail((String) puntoData.get("email"));
            // Los horarios vienen como string "HH:mm" y los convierto a LocalTime
            punto.setHorarioApertura(puntoData.get("horarioApertura") != null ? 
                java.time.LocalTime.parse((String) puntoData.get("horarioApertura")) : null);
            punto.setHorarioCierre(puntoData.get("horarioCierre") != null ? 
                java.time.LocalTime.parse((String) puntoData.get("horarioCierre")) : null);
            punto.setActivo(true); // Por defecto todos los puntos nuevos están activos
            
            // Verifico si viene información del creador para saber si es organización o admin
            if (puntoData.containsKey("usuarioCreadorId") && puntoData.containsKey("tipoCreador")) {
                Long usuarioCreadorId = ((Number) puntoData.get("usuarioCreadorId")).longValue();
                String tipoCreadorStr = (String) puntoData.get("tipoCreador");
                
                punto.setUsuarioCreadorId(usuarioCreadorId);
                punto.setTipoCreador(Rol.valueOf(tipoCreadorStr));
                
                // Si es una organización, el punto necesita aprobación del admin
                if (Rol.valueOf(tipoCreadorStr) == Rol.ORGANIZACION) {
                    punto.setEstado(EstadoPunto.PENDIENTE);
                } else {
                    // Si es admin, queda activo directamente
                    punto.setEstado(EstadoPunto.ACTIVO);
                }
            } else {
                // Si no viene información del creador, asumo que es un admin
                punto.setEstado(EstadoPunto.ACTIVO);
            }
            
            PuntoDonacion nuevoPunto = puntoDonacionRepository.save(punto);
            return ResponseEntity.ok(nuevoPunto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Actualiza un punto de donación existente
     * Permite actualización parcial: solo actualiza los campos que vienen en el request
     * También maneja la lógica de permisos: las organizaciones solo pueden editar sus propios puntos
     */
    @PutMapping("/{id}")
    @Transactional // Uso @Transactional para asegurar que todo se guarde o nada
    public ResponseEntity<PuntoDonacion> actualizarPunto(@PathVariable Long id, @RequestBody Map<String, Object> puntoData) {
        try {
            Optional<PuntoDonacion> puntoExistente = puntoDonacionRepository.findById(id);
            if (puntoExistente.isPresent()) {
                PuntoDonacion punto = puntoExistente.get();
                
                // Verifico permisos: si el punto fue creado por una organización,
                // solo esa organización puede editarlo
                if (punto.getTipoCreador() != null && punto.getTipoCreador() == Rol.ORGANIZACION && puntoData.containsKey("usuarioCreadorId")) {
                    Long usuarioId = ((Number) puntoData.get("usuarioCreadorId")).longValue();
                    if (punto.getUsuarioCreadorId() != null && !punto.getUsuarioCreadorId().equals(usuarioId)) {
                        return ResponseEntity.status(403).build(); // Forbidden - no tiene permisos
                    }
                }
                
                // Actualizo solo los campos que vienen en el request (actualización parcial)
                if (puntoData.containsKey("nombre") && puntoData.get("nombre") != null) {
                    punto.setNombre((String) puntoData.get("nombre"));
                }
                if (puntoData.containsKey("direccion") && puntoData.get("direccion") != null) {
                    punto.setDireccion((String) puntoData.get("direccion"));
                }
                if (puntoData.containsKey("latitud") && puntoData.get("latitud") != null) {
                    punto.setLatitud(((Number) puntoData.get("latitud")).doubleValue());
                }
                if (puntoData.containsKey("longitud") && puntoData.get("longitud") != null) {
                    punto.setLongitud(((Number) puntoData.get("longitud")).doubleValue());
                }
                if (puntoData.containsKey("tipoDonacion") && puntoData.get("tipoDonacion") != null) {
                    punto.setTipoDonacion((String) puntoData.get("tipoDonacion"));
                }
                if (puntoData.containsKey("telefono")) {
                    punto.setTelefono(puntoData.get("telefono") != null ? (String) puntoData.get("telefono") : null);
                }
                if (puntoData.containsKey("email")) {
                    punto.setEmail(puntoData.get("email") != null ? (String) puntoData.get("email") : null);
                }
                if (puntoData.containsKey("horarioApertura")) {
                    if (puntoData.get("horarioApertura") != null && !((String) puntoData.get("horarioApertura")).isEmpty()) {
                        punto.setHorarioApertura(java.time.LocalTime.parse((String) puntoData.get("horarioApertura")));
                    } else {
                        punto.setHorarioApertura(null);
                    }
                }
                if (puntoData.containsKey("horarioCierre")) {
                    if (puntoData.get("horarioCierre") != null && !((String) puntoData.get("horarioCierre")).isEmpty()) {
                        punto.setHorarioCierre(java.time.LocalTime.parse((String) puntoData.get("horarioCierre")));
                    } else {
                        punto.setHorarioCierre(null);
                    }
                }
                
                // Manejo especial para el campo "activo" porque puede venir en diferentes formatos
                // (boolean, string, number) y necesito normalizarlo
                if (puntoData.containsKey("activo")) {
                    Boolean activo = null;
                    Object activoObj = puntoData.get("activo");
                    // Convierto según el tipo que venga
                    if (activoObj instanceof Boolean) {
                        activo = (Boolean) activoObj;
                    } else if (activoObj instanceof String) {
                        activo = Boolean.parseBoolean((String) activoObj);
                    } else if (activoObj instanceof Number) {
                        activo = ((Number) activoObj).intValue() != 0;
                    }
                    if (activo != null) {
                        punto.setActivo(activo);
                    }
                }
                
                // Si una organización edita su punto que fue rechazado,
                // vuelve a estado PENDIENTE para que el admin lo revise de nuevo
                // Solo si está actualizando otros campos (no solo el activo)
                if (punto.getTipoCreador() != null && punto.getTipoCreador() == Rol.ORGANIZACION 
                    && punto.getEstado() == EstadoPunto.RECHAZADO 
                    && puntoData.size() > 1) { // Verifico que haya más campos además de activo
                    punto.setEstado(EstadoPunto.PENDIENTE);
                    punto.setMotivoRechazo(null); // Limpio el motivo de rechazo anterior
                }
                
                PuntoDonacion puntoGuardado = puntoDonacionRepository.save(punto);
                puntoDonacionRepository.flush();
                return ResponseEntity.ok(puntoGuardado);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Elimina o desactiva un punto de donación
     * La lógica es diferente según quién lo creó:
     * - Si fue creado por una organización: eliminación física (hard delete) - lo elimino de la BD
     * - Si fue creado por administrador: solo desactivo (soft delete) - queda en BD pero no se muestra
     * 
     * Esto lo hago así porque las organizaciones pueden eliminar sus propios puntos,
     * pero los puntos creados por admins solo se desactivan para mantener el historial
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> desactivarPunto(@PathVariable Long id, @RequestParam(required = false) Long usuarioId) {
        try {
            Optional<PuntoDonacion> punto = puntoDonacionRepository.findById(id);
            if (!punto.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            PuntoDonacion puntoActual = punto.get();
            
            // Determino si el punto fue creado por una organización
            boolean esDeOrganizacion = puntoActual.getTipoCreador() != null && 
                                      puntoActual.getTipoCreador() == Rol.ORGANIZACION;
            
            // Si no tiene tipoCreador pero tiene usuarioCreadorId, también lo trato como organización
            if (!esDeOrganizacion && puntoActual.getUsuarioCreadorId() != null && usuarioId != null) {
                esDeOrganizacion = true;
            }
            
            if (esDeOrganizacion) {
                // Para puntos de organizaciones: eliminación física
                // Primero verifico que el usuario tenga permisos
                if (usuarioId == null) {
                    return ResponseEntity.status(400).build(); // Falta el ID del usuario
                }
                
                if (puntoActual.getUsuarioCreadorId() == null) {
                    return ResponseEntity.status(400).build(); // El punto no tiene creador configurado
                }
                
                // Verifico que el usuario que intenta eliminar sea el mismo que lo creó
                if (!puntoActual.getUsuarioCreadorId().equals(usuarioId)) {
                    return ResponseEntity.status(403).build(); // No tiene permisos
                }
                
                // Elimino físicamente de la base de datos
                puntoDonacionRepository.delete(puntoActual);
                puntoDonacionRepository.flush();
                
                // Verifico que se eliminó correctamente
                Optional<PuntoDonacion> puntoVerificado = puntoDonacionRepository.findById(id);
                if (puntoVerificado.isPresent()) {
                    return ResponseEntity.status(500).build(); // Error: no se eliminó
                } else {
                    return ResponseEntity.ok().build(); // Eliminado correctamente
                }
            } else {
                // Para puntos de administradores: solo desactivo (soft delete)
                puntoActual.setActivo(false);
                puntoDonacionRepository.save(puntoActual);
                puntoDonacionRepository.flush();
                return ResponseEntity.ok().build();
            }
        } catch (Exception e) {
            System.err.println("Error en desactivarPunto: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    // Aprobar un punto pendiente (solo administradores)
    @PostMapping("/{id}/aprobar")
    public ResponseEntity<PuntoDonacion> aprobarPunto(@PathVariable Long id) {
        Optional<PuntoDonacion> punto = puntoDonacionRepository.findById(id);
        if (punto.isPresent()) {
            PuntoDonacion puntoActualizado = punto.get();
            puntoActualizado.setEstado(EstadoPunto.ACTIVO);
            puntoActualizado.setActivo(true);
            puntoActualizado.setMotivoRechazo(null); // Limpiar motivo de rechazo si existe
            PuntoDonacion puntoGuardado = puntoDonacionRepository.save(puntoActualizado);
            return ResponseEntity.ok(puntoGuardado);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Rechazar un punto pendiente (solo administradores)
    @PostMapping("/{id}/rechazar")
    public ResponseEntity<PuntoDonacion> rechazarPunto(@PathVariable Long id, @RequestBody Map<String, String> data) {
        Optional<PuntoDonacion> punto = puntoDonacionRepository.findById(id);
        if (punto.isPresent()) {
            PuntoDonacion puntoActualizado = punto.get();
            puntoActualizado.setEstado(EstadoPunto.RECHAZADO);
            puntoActualizado.setMotivoRechazo(data.get("motivoRechazo"));
            PuntoDonacion puntoGuardado = puntoDonacionRepository.save(puntoActualizado);
            return ResponseEntity.ok(puntoGuardado);
        }
        return ResponseEntity.notFound().build();
    }
}

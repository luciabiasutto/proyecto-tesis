package com.donaciones.donacionesbackend.controller;

import com.donaciones.donacionesbackend.entity.PuntoDonacion;
import com.donaciones.donacionesbackend.entity.TipoDonacion;
import com.donaciones.donacionesbackend.entity.EstadoPunto;
import com.donaciones.donacionesbackend.entity.Rol;
import com.donaciones.donacionesbackend.entity.Organizacion;
import com.donaciones.donacionesbackend.repository.PuntoDonacionRepository;
import com.donaciones.donacionesbackend.repository.OrganizacionRepository;
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
import java.util.stream.Collectors;

//Controlador de puntos de donación
@RestController
@RequestMapping("/puntos-donacion")
@CrossOrigin(origins = "*") // Permito CORS para que el frontend pueda hacer peticiones
public class PuntoDonacionController {
    
    @Autowired
    private PuntoDonacionRepository puntoDonacionRepository;
    
    @Autowired
    private OrganizacionRepository organizacionRepository;
    
    //Devuelve todos los puntos sin filtrar
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
    
    //Lista puntos según el parámetro
    @GetMapping
    public ResponseEntity<List<PuntoDonacion>> getAllPuntosActivos(@RequestParam(required = false) String todos) {
        try {
            // Verifico si se está solicitando todos los puntos
            // Acepto tanto "true" como "1" para mayor flexibilidad
            boolean solicitarTodos = todos != null && (todos.equalsIgnoreCase("true") || todos.equals("1"));
            
            if (solicitarTodos) {
                // Para administradores devuelvo todos los puntos
                List<PuntoDonacion> puntos = puntoDonacionRepository.findAll();
                return ResponseEntity.ok(puntos);
            } else {
                // Para el mapa público solo puntos activos y aprobados
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
     * Trae los puntos que esperan aprobación del admin, con el nombre de la org que los creó.
     * Lo usa el administrador en la pantalla Aprobar puntos
     */
    @GetMapping("/pendientes")
    public ResponseEntity<List<Map<String, Object>>> getPuntosPendientes() {
        try {
            List<PuntoDonacion> puntos = puntoDonacionRepository.findByEstado(EstadoPunto.PENDIENTE);
            List<Map<String, Object>> puntosConOrganizacion = new java.util.ArrayList<>();
            
            for (PuntoDonacion punto : puntos) {
                Map<String, Object> puntoData = new HashMap<>();
                puntoData.put("id", punto.getId());
                puntoData.put("nombre", punto.getNombre());
                puntoData.put("direccion", punto.getDireccion());
                puntoData.put("latitud", punto.getLatitud());
                puntoData.put("longitud", punto.getLongitud());
                puntoData.put("tipoDonacion", punto.getTipoDonacion());
                puntoData.put("horarioApertura", punto.getHorarioApertura());
                puntoData.put("horarioCierre", punto.getHorarioCierre());
                puntoData.put("telefono", punto.getTelefono());
                puntoData.put("email", punto.getEmail());
                puntoData.put("activo", punto.getActivo());
                puntoData.put("estado", punto.getEstado());
                puntoData.put("motivoRechazo", punto.getMotivoRechazo());
                puntoData.put("usuarioCreadorId", punto.getUsuarioCreadorId());
                puntoData.put("tipoCreador", punto.getTipoCreador());
                
                // Obtener el nombre de la organización si existe
                if (punto.getUsuarioCreadorId() != null) {
                    Optional<Organizacion> organizacion = organizacionRepository.findById(punto.getUsuarioCreadorId());
                    if (organizacion.isPresent()) {
                        puntoData.put("nombreOrganizacion", organizacion.get().getNombre());
                    } else {
                        puntoData.put("nombreOrganizacion", null);
                    }
                } else {
                    puntoData.put("nombreOrganizacion", null);
                }
                
                puntosConOrganizacion.add(puntoData);
            }
            
            return ResponseEntity.ok(puntosConOrganizacion);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    //Lista los puntos creados por una organización en particular
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
    
    //Devuelve el detalle de un punto por su ID
    @GetMapping("/{id}")
    public ResponseEntity<PuntoDonacion> getPuntoById(@PathVariable Long id) {
        Optional<PuntoDonacion> punto = puntoDonacionRepository.findById(id);
        return punto.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    //Filtra puntos activos por tipo de donación 
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<PuntoDonacion>> getPuntosByTipo(@PathVariable TipoDonacion tipo) {
        List<PuntoDonacion> puntos = puntoDonacionRepository.findByTipoDonacionAndActivoTrue(tipo);
        return ResponseEntity.ok(puntos);
    }
    
    /**
     * busca puntos dentro de un radio en kilómetros desde una lat/lng
     * lo usa el donante en el mapa para encontrar lugares cerca de su ubicación
     */
    @GetMapping("/cercanos")
    public ResponseEntity<List<PuntoDonacion>> getPuntosCercanos(
            @RequestParam Double latitud,
            @RequestParam Double longitud,
            @RequestParam(defaultValue = "10") Double radioKm) {
        List<PuntoDonacion> puntos = puntoDonacionRepository.findPuntosCercanos(latitud, longitud, radioKm);
        return ResponseEntity.ok(puntos);
    }
    
    //busca puntos activos por nombre
    @GetMapping("/buscar")
    public ResponseEntity<List<PuntoDonacion>> buscarPuntos(@RequestParam String nombre) {
        List<PuntoDonacion> puntos = puntoDonacionRepository.findByNombreContainingIgnoreCaseAndActivoTrue(nombre);
        return ResponseEntity.ok(puntos);
    }
    
    /**
     * Responde las peticiones OPTIONS
     * Lo necesita el navegador antes de POST/PUT/DELETE; no lo llama ningún usuario directamente
     */
    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Max-Age", "3600");
        return ResponseEntity.ok().build();
    }

    //Crea un punto nuevo
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
    
    //Actualiza los datos de un punto
    @PutMapping("/{id}")
    @Transactional // Uso @Transactional para asegurar que todo se guarde o nada
    public ResponseEntity<PuntoDonacion> actualizarPunto(@PathVariable Long id, @RequestBody Map<String, Object> puntoData) {
        try {
            Optional<PuntoDonacion> puntoExistente = puntoDonacionRepository.findById(id);
            if (puntoExistente.isPresent()) {
                PuntoDonacion punto = puntoExistente.get();
                
                // Verifico permisos
                if (punto.getTipoCreador() != null && punto.getTipoCreador() == Rol.ORGANIZACION && puntoData.containsKey("usuarioCreadorId")) {
                    Long usuarioId = ((Number) puntoData.get("usuarioCreadorId")).longValue();
                    if (punto.getUsuarioCreadorId() != null && !punto.getUsuarioCreadorId().equals(usuarioId)) {
                        return ResponseEntity.status(403).build(); // Forbidden - no tiene permisos
                    }
                }
                
                // Actualizo solo los campos que vienen en el request
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
    
    //Elimina o desactiva un punto según quién lo creó
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> desactivarPunto(@PathVariable Long id, @RequestParam(required = false) Long usuarioId) {
        try {
            System.out.println("=== Eliminando punto ===");
            System.out.println("Punto ID: " + id);
            System.out.println("Usuario ID recibido: " + usuarioId);
            
            Optional<PuntoDonacion> punto = puntoDonacionRepository.findById(id);
            if (!punto.isPresent()) {
                System.err.println("Error: Punto " + id + " no encontrado");
                return ResponseEntity.notFound().build();
            }
            
            PuntoDonacion puntoActual = punto.get();
            System.out.println("Punto encontrado: " + puntoActual.getNombre());
            System.out.println("Tipo creador: " + puntoActual.getTipoCreador());
            System.out.println("Usuario creador ID: " + puntoActual.getUsuarioCreadorId());
            
            // Determino si el punto fue creado por una organización
            boolean esDeOrganizacion = puntoActual.getTipoCreador() != null && 
                                      puntoActual.getTipoCreador() == Rol.ORGANIZACION;
            
            System.out.println("Es de organización (por tipoCreador): " + esDeOrganizacion);
            
            // Si no tiene tipoCreador pero tiene usuarioCreadorId, también lo trato como organización
            if (!esDeOrganizacion && puntoActual.getUsuarioCreadorId() != null && usuarioId != null) {
                esDeOrganizacion = true;
                System.out.println("Es de organización (por usuarioCreadorId): " + esDeOrganizacion);
            }
            
            // Si el usuario está intentando eliminar y es una organización, y el punto aparece en su lista,
            // entonces es de organización
            if (!esDeOrganizacion && usuarioId != null) {
                List<PuntoDonacion> puntosOrganizacion = puntoDonacionRepository.findByUsuarioCreadorIdAndTipoCreador(usuarioId, Rol.ORGANIZACION);
                boolean estaEnLista = puntosOrganizacion.stream().anyMatch(p -> p.getId().equals(id));
                if (estaEnLista) {
                    esDeOrganizacion = true;
                    System.out.println("Es de organización (porque está en la lista de la organización): " + esDeOrganizacion);
                }
            }
            
            if (esDeOrganizacion) {
                // Para puntos de organizaciones: eliminación física
                // Primero verifico que el usuario tenga permisos
                if (usuarioId == null) {
                    System.err.println("Error: usuarioId es null al intentar eliminar punto " + id);
                    return ResponseEntity.status(400).body(null); // Falta el ID del usuario
                }
                
                // Verifico los permisos para eliminar
                // si el punto está en la lista de puntos de la organización,
                // entonces el usuario tiene permisos para eliminarlo
                boolean tienePermisos = false;
                
                // Primero verifico si el punto tiene usuarioCreadorId y coincide
                if (puntoActual.getUsuarioCreadorId() != null) {
                    Long usuarioCreadorId = puntoActual.getUsuarioCreadorId();
                    if (usuarioCreadorId.equals(usuarioId)) {
                        tienePermisos = true;
                        System.out.println("✓ Permisos: usuarioCreadorId (" + usuarioCreadorId + ") coincide con usuarioId (" + usuarioId + ")");
                    }
                }
                
                // Si aún no tiene permisos, verifico si el punto está en la lista de puntos de la organización
                if (!tienePermisos) {
                    System.out.println("Verificando si el punto está en la lista de puntos de la organización " + usuarioId);
                    List<PuntoDonacion> puntosOrganizacion = puntoDonacionRepository.findByUsuarioCreadorIdAndTipoCreador(usuarioId, Rol.ORGANIZACION);
                    boolean estaEnLista = puntosOrganizacion.stream().anyMatch(p -> p.getId().equals(id));
                    
                    if (estaEnLista) {
                        tienePermisos = true;
                        System.out.println("✓ Permisos: el punto está en la lista de puntos de la organización");
                    } else {
                        // Si el punto no tiene usuarioCreadorId pero está en estado válido, permitir eliminación
                        // Esto maneja casos donde el punto fue creado antes de implementar usuarioCreadorId
                        if (puntoActual.getUsuarioCreadorId() == null && 
                            (puntoActual.getEstado() == EstadoPunto.PENDIENTE || puntoActual.getEstado() == EstadoPunto.ACTIVO)) {
                            tienePermisos = true;
                            System.out.println("✓ Permisos: punto sin usuarioCreadorId pero en estado válido");
                        }
                    }
                }
                
                if (!tienePermisos) {
                    System.err.println("✗ Acceso denegado: el usuario " + usuarioId + " no tiene permisos para eliminar el punto " + id);
                    System.err.println("  - usuarioCreadorId del punto: " + puntoActual.getUsuarioCreadorId());
                    System.err.println("  - estado del punto: " + puntoActual.getEstado());
                    return ResponseEntity.status(403).body(null);
                }
                
                // Elimino físicamente de la base de datos
                puntoDonacionRepository.delete(puntoActual);
                puntoDonacionRepository.flush();
                
                // Verifico que se eliminó correctamente
                Optional<PuntoDonacion> puntoVerificado = puntoDonacionRepository.findById(id);
                if (puntoVerificado.isPresent()) {
                    return ResponseEntity.status(500).build(); // Error no se eliminó
                } else {
                    return ResponseEntity.ok().build(); // Eliminado 
                }
            } else {
                // Para puntos de administradores solo desactivo (soft delete)
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
    
    /**
     * Aprueba un punto que estaba pendiente y lo deja visible en el mapa
     * solo lo usa el administrador desde la pantalla de aprobación de puntos
     */
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
    
    //Rechaza un punto pendiente y guarda el motivo para que la org lo vea
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

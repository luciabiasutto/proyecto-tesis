package com.donaciones.donacionesbackend.controller;

import com.donaciones.donacionesbackend.entity.PuntoDonacion;
import com.donaciones.donacionesbackend.entity.TipoDonacion;
import com.donaciones.donacionesbackend.repository.PuntoDonacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/puntos-donacion")
@CrossOrigin(origins = "http://localhost:3000")
public class PuntoDonacionController {
    
    @Autowired
    private PuntoDonacionRepository puntoDonacionRepository;
    
    // Obtener todos los puntos de donación activos
    @GetMapping
    public ResponseEntity<List<PuntoDonacion>> getAllPuntosActivos() {
        List<PuntoDonacion> puntos = puntoDonacionRepository.findByActivoTrue();
        return ResponseEntity.ok(puntos);
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
    
    // Crear nuevo punto de donación
    @PostMapping
    public ResponseEntity<PuntoDonacion> crearPunto(@RequestBody PuntoDonacion punto) {
        PuntoDonacion nuevoPunto = puntoDonacionRepository.save(punto);
        return ResponseEntity.ok(nuevoPunto);
    }
    
    // Actualizar punto de donación
    @PutMapping("/{id}")
    public ResponseEntity<PuntoDonacion> actualizarPunto(@PathVariable Long id, @RequestBody PuntoDonacion puntoActualizado) {
        Optional<PuntoDonacion> puntoExistente = puntoDonacionRepository.findById(id);
        if (puntoExistente.isPresent()) {
            puntoActualizado.setId(id);
            PuntoDonacion puntoGuardado = puntoDonacionRepository.save(puntoActualizado);
            return ResponseEntity.ok(puntoGuardado);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Desactivar punto de donación (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivarPunto(@PathVariable Long id) {
        Optional<PuntoDonacion> punto = puntoDonacionRepository.findById(id);
        if (punto.isPresent()) {
            punto.get().setActivo(false);
            puntoDonacionRepository.save(punto.get());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}

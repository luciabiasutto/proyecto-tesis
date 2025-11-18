package com.donaciones.donacionesbackend.controller;

import com.donaciones.donacionesbackend.entity.Donacion;
import com.donaciones.donacionesbackend.entity.EstadoDonacion;
import com.donaciones.donacionesbackend.entity.PuntoDonacion;
import com.donaciones.donacionesbackend.entity.TipoDonacion;
import com.donaciones.donacionesbackend.repository.DonacionRepository;
import com.donaciones.donacionesbackend.repository.PuntoDonacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/donaciones")
@CrossOrigin(origins = "http://localhost:3000")
public class DonacionController {
    
    @Autowired
    private DonacionRepository donacionRepository;
    
    @Autowired
    private PuntoDonacionRepository puntoDonacionRepository;
    
    // Obtener todas las donaciones
    @GetMapping
    public ResponseEntity<List<Donacion>> getAllDonaciones() {
        List<Donacion> donaciones = donacionRepository.findAll();
        return ResponseEntity.ok(donaciones);
    }
    
    // Obtener una donación por ID
    @GetMapping("/{id}")
    public ResponseEntity<Donacion> getDonacionById(@PathVariable Long id) {
        Optional<Donacion> donacion = donacionRepository.findById(id);
        return donacion.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    // Crear nueva donación
    @PostMapping
    public ResponseEntity<Donacion> crearDonacion(@RequestBody Donacion donacion) {
        // Verificar que el punto de donación existe
        if (donacion.getPuntoDonacion() != null && donacion.getPuntoDonacion().getId() != null) {
            Optional<PuntoDonacion> punto = puntoDonacionRepository.findById(donacion.getPuntoDonacion().getId());
            if (punto.isPresent()) {
                donacion.setPuntoDonacion(punto.get());
            } else {
                return ResponseEntity.badRequest().build();
            }
        }
        
        Donacion nuevaDonacion = donacionRepository.save(donacion);
        return ResponseEntity.ok(nuevaDonacion);
    }
    
    // Actualizar estado de donación
    @PutMapping("/{id}/estado")
    public ResponseEntity<Donacion> actualizarEstado(@PathVariable Long id, @RequestParam EstadoDonacion estado) {
        Optional<Donacion> donacion = donacionRepository.findById(id);
        if (donacion.isPresent()) {
            donacion.get().setEstado(estado);
            if (estado == EstadoDonacion.ENTREGADA) {
                donacion.get().setFechaEntrega(LocalDateTime.now());
            }
            Donacion donacionActualizada = donacionRepository.save(donacion.get());
            return ResponseEntity.ok(donacionActualizada);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Obtener donaciones por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Donacion>> getDonacionesByEstado(@PathVariable EstadoDonacion estado) {
        List<Donacion> donaciones = donacionRepository.findByEstado(estado);
        return ResponseEntity.ok(donaciones);
    }
    
    // Obtener donaciones por punto de donación
    @GetMapping("/punto/{puntoId}")
    public ResponseEntity<List<Donacion>> getDonacionesByPunto(@PathVariable Long puntoId) {
        Optional<PuntoDonacion> punto = puntoDonacionRepository.findById(puntoId);
        if (punto.isPresent()) {
            List<Donacion> donaciones = donacionRepository.findByPuntoDonacion(punto.get());
            return ResponseEntity.ok(donaciones);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Obtener trazabilidad de donación
    @GetMapping("/{id}/trazabilidad")
    public ResponseEntity<List<Donacion>> getTrazabilidad(@PathVariable Long id) {
        List<Donacion> trazabilidad = donacionRepository.findTrazabilidadById(id);
        return ResponseEntity.ok(trazabilidad);
    }
    
    // Obtener estadísticas
    @GetMapping("/estadisticas")
    public ResponseEntity<Object> getEstadisticas() {
        long totalDonaciones = donacionRepository.count();
        long recibidas = donacionRepository.countByEstado(EstadoDonacion.RECIBIDA);
        long clasificadas = donacionRepository.countByEstado(EstadoDonacion.CLASIFICADA);
        long distribuidas = donacionRepository.countByEstado(EstadoDonacion.DISTRIBUIDA);
        long entregadas = donacionRepository.countByEstado(EstadoDonacion.ENTREGADA);
        
        return ResponseEntity.ok(new Object() {
            public final long total = totalDonaciones;
            public final long recibidas = recibidas;
            public final long clasificadas = clasificadas;
            public final long distribuidas = distribuidas;
            public final long entregadas = entregadas;
        });
    }
}

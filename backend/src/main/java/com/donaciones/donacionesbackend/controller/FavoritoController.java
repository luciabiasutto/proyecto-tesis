package com.donaciones.donacionesbackend.controller;

import com.donaciones.donacionesbackend.entity.Favorito;
import com.donaciones.donacionesbackend.repository.FavoritoRepository;
import com.donaciones.donacionesbackend.repository.PuntoDonacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

//Controlador de favoritos
@RestController
@RequestMapping("/favoritos")
@CrossOrigin(origins = "*")
public class FavoritoController {
    
    @Autowired
    private FavoritoRepository favoritoRepository;
    
    @Autowired
    private PuntoDonacionRepository puntoDonacionRepository;
    
    //Lista todos los favoritos de un donante 
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> getFavoritosByUsuario(@PathVariable Long usuarioId) {
        try {
            List<Favorito> favoritos = favoritoRepository.findByUsuarioId(usuarioId);
            return ResponseEntity.ok(favoritos);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener favoritos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    //Marca un punto como favorito para un donante
    @PostMapping
    public ResponseEntity<?> crearFavorito(@RequestBody Map<String, Object> request) {
        try {
            Long usuarioId = Long.valueOf(request.get("usuarioId").toString());
            Long puntoDonacionId = Long.valueOf(request.get("puntoDonacionId").toString());
            
            // Verificar si el punto existe
            if (!puntoDonacionRepository.existsById(puntoDonacionId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El punto de donación no existe");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            // Verificar si ya existe el favorito
            Optional<Favorito> favoritoExistente = favoritoRepository.findByUsuarioIdAndPuntoDonacionId(usuarioId, puntoDonacionId);
            if (favoritoExistente.isPresent()) {
                return ResponseEntity.ok(favoritoExistente.get());
            }
            
            // Crear nuevo favorito
            Favorito favorito = new Favorito(usuarioId, puntoDonacionId);
            favorito = favoritoRepository.save(favorito);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(favorito);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear favorito: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    //Quita un favorito de la lista del donante
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarFavorito(@PathVariable Long id) {
        try {
            if (!favoritoRepository.existsById(id)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El favorito no existe");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            favoritoRepository.deleteById(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Favorito eliminado correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar favorito: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    //Cambia la etiqueta personal de un favorito
    @PutMapping("/{id}/etiqueta")
    public ResponseEntity<?> actualizarEtiqueta(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Optional<Favorito> favoritoOpt = favoritoRepository.findById(id);
            if (!favoritoOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El favorito no existe");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            Favorito favorito = favoritoOpt.get();
            favorito.setEtiqueta(request.get("etiqueta"));
            favorito = favoritoRepository.save(favorito);
            
            return ResponseEntity.ok(favorito);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar etiqueta: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    //Agenda una fecha para ir a donar en ese punto favorito
    @PutMapping("/{id}/agendar")
    public ResponseEntity<?> agendarFavorito(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Optional<Favorito> favoritoOpt = favoritoRepository.findById(id);
            if (!favoritoOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El favorito no existe");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            Favorito favorito = favoritoOpt.get();
            String fechaStr = request.get("fechaAgendada");
            if (fechaStr != null && !fechaStr.isEmpty()) {
                // Parsear fecha en formato YYYY-MM-DD
                java.time.LocalDate fechaLocal = java.time.LocalDate.parse(fechaStr);
                LocalDateTime fechaAgendada = fechaLocal.atStartOfDay();
                favorito.setFechaAgendada(fechaAgendada);
            } else {
                favorito.setFechaAgendada(null);
            }
            
            favorito = favoritoRepository.save(favorito);
            
            return ResponseEntity.ok(favorito);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al agendar favorito: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}


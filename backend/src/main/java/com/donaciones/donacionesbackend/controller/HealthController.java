package com.donaciones.donacionesbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

//Controlador de salud del backend
@RestController
@RequestMapping("/")
@CrossOrigin(origins = "*")
public class HealthController {

    //Responde si el servidor está funcionando y lista algunos endpoints útiles
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Backend funcionando correctamente");
        response.put("endpoints", Map.of(
            "auth", "/api/auth/login y /api/auth/register",
            "puntos", "/api/puntos-donacion",
            "test", "/api/test"
        ));
        return ResponseEntity.ok(response);
    }
}






